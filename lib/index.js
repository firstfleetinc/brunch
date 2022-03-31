import { initSkeleton } from "./init-skeleton.js";
import BrunchError from "./utils/error.js";
import loggy from "loggy";
import { BrunchWatcher } from "./watch.js";
'use strict';
/**
 * Initialize new brunch project.
 * @param {Object} options - skeleton like 'simple', path like '.'
 */
async function create(options = {}) {
    // Check for legacy syntax
    if (options.parent) {
        const rawArgs = options.parent.rawArgs;
        const newArgs = rawArgs.slice(rawArgs.indexOf('new') + 1);
        const oldSyntax = !options.skeleton && newArgs.length === 2;
        if (oldSyntax) {
            throw new BrunchError('LEGACY_NEW_SYNTAX', {
                skeleton: newArgs[0],
                path: newArgs[1],
            });
        }
    }
    try {
        return await initSkeleton(options.skeleton, options.path);
    }
    catch (error) {
        loggy.error(error);
    }
}
;
function build(options) {
    const hasDebug = obj => {
        return obj && typeof obj === 'object' && obj.debug;
    };
    const isDebug = hasDebug(options);
    if (isDebug) {
        let ns = typeof isDebug === 'string' ? isDebug : '*';
        if (ns !== 'speed')
            ns = `brunch:${ns}`;
        process.env.DEBUG = ns;
    }
    // We require `watch` after we assigned `process.env.DEBUG` any value.
    // Otherwise it would be `undefined` and debug messages wouldn't be shown.
    const watcher = new BrunchWatcher(options);
    watcher.init();
    return watcher;
}
;
const build$0 = options => build({ path: '.', ...options, persistent: false });
export const watch = options => build({ path: '.', ...options, persistent: true });
export { create as new };
export { build$0 as build };
