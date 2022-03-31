import debug from "debug";
import logger from "loggy";
import { profile as profile$0 } from "since-app-start";
import { flatten, deepFreeze } from "./helpers.js";
import BrunchError from "./error.js";
import adapter from "./plugin-adapter.js";
import sysPath from "universal-path";
import {createRequire} from "module";
const requireUrl = createRequire(import.meta.url);
const brunchdebug = debug('brunch:plugins');
const profile = { profile: profile$0 }.profile;
const loadPackage = async pkgPath => {
    profile('Loading plugins');
    // ESM does not need require.cache
    //const clearCache = () => delete require.cache[pkgPath];
    try {
        //clearCache();
        const pkg = requireUrl(pkgPath);
        if (!pkg.dependencies)
            pkg.dependencies = {};
        if (!pkg.devDependencies)
            pkg.devDependencies = {};
        return deepFreeze(pkg, ['static', 'overrides']);
    }
    catch (error) {
        throw new BrunchError('CWD_INVALID', { error });
    }
    finally {
        //clearCache();
    }
};
const uniqueDeps = pkg => {
    const deps = pkg.dependencies;
    const names = Object.keys(deps);
    Object.keys(pkg.devDependencies).forEach(devDep => {
        if (devDep in deps) {
            logger.warn(`You have declared ${devDep} in package.json more than once`);
        }
        else {
            names.push(devDep);
        }
    });
    return names;
};
/* Load brunch plugins, group them and initialise file watcher.
 *
 * configParams - Object. Optional. Params will be set as default config items.
 *
 */
const ignoredPlugins = [
    'javascript-brunch',
    'css-brunch',
];
/**
 * Method was made async to support cjs and esm dynamic imports,
 * parth of the patch described below
 */
const plugins = async (config, craDeps) => {
    profile('Loaded config');
    const absRoot = sysPath.resolve(config.paths.root);
    const pkgPath = sysPath.join(absRoot, config.paths.packageConfig);
    const npmPath = sysPath.join(absRoot, 'node_modules');
    const pkg = config.cra ? { dependencies: craDeps } : await loadPackage(pkgPath);
    const on = config.plugins.on;
    const off = config.plugins.off;
    const only = config.plugins.only;
    const deps = uniqueDeps(pkg).filter(name => {
        if (!name.includes('brunch'))
            return false;
        if (ignoredPlugins.includes(name))
            return false;
        if (off.includes(name))
            return false;
        if (only.length && !only.includes(name))
            return false;
        return true;
    });
    /**
       * FIRSTFLEET CUSTOM PATCH STARTS HERR
       *
       * This is a custo patch applied through
       * {@link https://github.com/ds300/patch-package}
       *
       * This patch allows dynamic imports. This is so brunch can work with both CommonJS plugins
       * as well as ESM (es6 module) plugins.
       *
       * In order to update some of the dependencies that our plugins rely on, we need to be able
       * to move the plugins to ESM. However, brunch needs to be able to load ESM modules in order
       * for those updates to work. Thus, the patch.
       */
    // Holds the plugins that brunch will load
    let plugins = [];
    // Look at all the brunch dependencies
    for (let x = 0; x < deps.length; x++) {
        const name = deps[x];
        // Dynamically load the plugin
        const Plugin = await import(`${name}?id=${Math.random().toString(36).substring(3)}`);
        // Make sure its a brunch plugin
        if (Plugin && Plugin.default.prototype && Plugin.default.prototype.brunchPlugin) {
            // Instantiate the plugin
            const plugin = new Plugin.default(config);
            // Give it the correct name
            plugin.brunchPluginName = name;
            // Mount the plugin
            plugins.push(adapter(plugin));
        }
    }
    plugins = plugins.filter(plugin => {
        // Does the user's config say this plugin should definitely be used?
        if (on.includes(plugin.brunchPluginName))
            return true;
        // If the plugin is an optimizer that doesn't specify a defaultEnv
        // decide based on the config.optimize setting
        const env = plugin.defaultEnv;
        if (!env) {
            return plugin.optimize ? config.optimize : true;
        }
        // Finally, is it meant for either any environment or
        // an active environment?
        return env === '*' || config.env.includes(env);
    });
    /**
       * This is the old code that the patch replaced.
       */
    //  const plugins = deps
    //    .reduce((plugins, name) => {
    //      try {
    //        const Plugin = require(sysPath.join(npmPath, name));
    //        if (Plugin && Plugin.prototype && Plugin.prototype.brunchPlugin) {
    //          const plugin = new Plugin(config);
    //          plugin.brunchPluginName = name;
    //          plugins.push(adapter(plugin));
    //        }
    //      } catch (error) {
    //        if (error.code === 'MODULE_NOT_FOUND' && name in pkg.dependencies) {
    //          throw new BrunchError('RUN_NPM_INSTALL', {error});
    //        }
    //        logger.warn(`Loading of ${name} failed due to`, error);
    //      }
    //      return plugins;
    //    }, [])
    //    .filter(plugin => {
    //      // Does the user's config say this plugin should definitely be used?
    //      if (on.includes(plugin.brunchPluginName)) return true;
    //
    //      // If the plugin is an optimizer that doesn't specify a defaultEnv
    //      // decide based on the config.optimize setting
    //      const env = plugin.defaultEnv;
    //      if (!env) {
    //        return plugin.optimize ? config.optimize : true;
    //      }
    //
    //      // Finally, is it meant for either any environment or
    //      // an active environment?
    //      return env === '*' || config.env.includes(env);
    //    });
    /**
       * FIRSTFLEET CUSTOM PATCH STOPS HERE
       */
    const respondTo = key => plugins.filter(plugin => {
        return typeof plugin[key] === 'function';
    });
    const compilers = respondTo('compile');
    const names = plugins.map(plugin => plugin.brunchPluginName).join(', ');
    brunchdebug(`Loaded plugins: ${names}`);
    if (config.hot) {
        const hmrCompiler = compilers.find(compiler => {
            return compiler.brunchPluginName === 'auto-reload-brunch';
        });
        if (!hmrCompiler)
            throw new BrunchError('HMR_PLUGIN_MISSING');
        if (!hmrCompiler.supportsHMR)
            throw new BrunchError('HMR_PLUGIN_UNSUPPORTED');
    }
    /* Get paths to files that plugins include. E.g. handlebars-brunch includes
     * `../vendor/handlebars-runtime.js` with path relative to plugin.
     */
    const getIncludes = () => {
        const includes = plugins.map(plugin => {
            return plugin.include.then(paths => {
                return paths.map(path => {
                    if (!sysPath.isAbsolute(path)) {
                        path = sysPath.join(npmPath, plugin.brunchPluginName, path);
                    }
                    return sysPath.relative(absRoot, path);
                });
            });
        });
        // TODO: for-of
        return Promise.all(includes).then(flatten);
    };
    return getIncludes().then(includes => {
        helpers.push(...includes);
        profile('Loaded plugins');
        return {
            hooks: {
                preCompile: respondTo('preCompile'),
                onCompile: respondTo('onCompile'),
                teardown: respondTo('teardown'),
            },
            plugins: {
                includes,
                compilers,
                optimizers: respondTo('optimize'),
                all: plugins,
            },
        };
    });
};
const helpers = plugins.helpers = [];
export default plugins;
