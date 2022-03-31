import rewire from "rewire";
import chai from "chai";
'use strict';
const { expect } = chai;
import * as application from '../lib/utils/config.js';

describe('applyOverrides', () => {

    it('resolves plugins.on|off merge', () => {
        // describe('replaceConfigSlashes()', function() {
        //   return it('should replace slashes with backslashes in config', function() {
        //     application.__set__('isWindows', true);
        //     const unix = require('./fixtures/unix_config');
        //     const win = require('./fixtures/win_config');
        //     return expect(application.replaceConfigSlashes(unix.config)).to.eql(win.config);
        //   });
        // });
        const applyOverrides = application.applyOverrides;
        console.log('applyOverrides', applyOverrides)
        const config = {
            server: {},
            plugins: {
                on: ['a'],
                off: ['b'],
            },
            overrides: {
                foo: {
                    plugins: {
                        on: ['b'],
                    },
                },
                bar: {
                    plugins: {
                        off: ['a'],
                    },
                },
                baz: {
                    plugins: {
                        on: ['c'],
                    },
                },
            },
            files: {},
            paths: {},
            hooks: {},
        };
        applyOverrides(config, [
            'foo', 'bar', 'baz',
        ]);
        expect(config.plugins).to.deep.equal({
            on: ['c', 'b'],
            off: ['a'],
        });
    });
});
