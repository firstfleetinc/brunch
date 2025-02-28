# Brunch

> Web applications made easy. Since 2011.

Fast front-end web app build tool with simple declarative config and seamless incremental compilation for rapid development.

# FORK

This is a fork of the official brunch repo. This fork will have changes that are not present in the offical version.

## Changelist
1. Revert back to the 4.0.0 commit
2. Modify the plugins.js to use common js dynamic imports for plugins. This allows both common js and es modules to be used in the build pipeline.
3. Change package name to @firstfleet/brunch for internal npm package use
4. Added a new config value under config.npm.checkDependencies. This value controls whether brunch will try to update or install npm packages on watch and build. It defaults to true for backwards compatibility, but if set to false, brunch will not update or install npm packages. This adds support for things like monorepos, where your npm packages will be at the root of the workspace, and not at the project level.

## Usage

Install Brunch with a simple node.js package manager command:

    npm install -g @firstfleet/brunch

1. **Create** a new Brunch project: `brunch new [--skeleton url]`
    - skeleton specifies a skeleton from which your application will be initialized.
    The default skeleton (dead-simple) doesn't have any opinions about frameworks or libraries.
    - [brunch.io/skeletons](https://brunch.io/skeletons) contains over 50
    boilerplate projects, which you can use to init your app from.
2. **Develop** with Brunch: `brunch watch --server`
    - tells Brunch to watch your project and incrementally rebuild it when source files are changed.
    The optional server flag launches a simple web server with push state support.
3. **Deploy** with Brunch: `brunch build --production`
    - builds a project for distribution. By default it enables minification.

## Learn

- Visit [**brunch.io**](https://brunch.io)
- Read [**brunch docs**](https://brunch.io/docs/getting-started)
- Follow us on Twitter: [@brunch](https://twitter.com/brunch)
- Ask questions on Stack Overflow with [#brunch](https://stackoverflow.com/questions/tagged/brunch) tag

## Contributing

See the [CONTRIBUTING.md](https://github.com/brunch/brunch/blob/master/CONTRIBUTING.md) document for more info on how to file issues or get your head into the Brunch's internals.

- To install edge version (from GitHub `master` branch): `npm install -g brunch/brunch`
- To enable debug mode, simply pass `-d` flag to any command like that: `brunch build -d`
- To create your own plugin, check out our [plugin boilerplate](https://github.com/brunch/brunch-boilerplate-plugin) as a starting point.

## License

MIT license (c) 2021 Paul Miller [paulmillr.com](https://paulmillr.com), Elan Shanker,
Nik Graf, Thomas Schranz, Allan Berger, Jan Monschke, Martin Schürrer

See LICENSE file.
