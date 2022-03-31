import path from "path";
import fs from "fs-extra";
import cp from "child_process";
import { tmpdir } from "os";
import { stdout } from "test-console";
import { stderr } from "test-console";
import http from "http";
'use strict';
const rootPath = process.cwd();
const tmp = path.join({ tmpdir }.tmpdir(), 'brunch-tests');
const createPackageJson = () => {
    const minimalJson = `{
    "name": "brunch-app",
    "description": "Description",
    "author": "Your Name",
    "version": "0.1.0",
    "dependencies": {},
    "devDependencies": {
      "javascript-brunch": "^2.0.0"
    }
  }`;
    fs.writeFileSync('package.json', minimalJson);
};
const prepareTestDir = () => {
    fs.mkdirsSync(tmp);
    process.chdir(tmp);
    createPackageJson();
};
const teardownTestDir = () => {
    process.chdir(rootPath);
    fs.removeSync(tmp);
};
function fileExists(path) {
    fs.accessSync(path, fs.F_OK);
}
;
const fileDoesNotExist = path => {
    const msg = `File ${path} should not exist`;
    try {
        fs.accessSync(path, fs.F_OK);
        throw new Error(msg);
    }
    catch (e) {
        if (e.message === msg)
            throw e;
    }
};
const fileContains = (path, content) => {
    const file = fs.readFileSync(path, 'utf8');
    if (!file.includes(content)) {
        throw new Error(`file ${path} does not contain '${content}'`);
    }
};
const fileEquals = (path, content) => {
    const file = fs.readFileSync(path, 'utf8');
    if (file !== content) {
        throw new Error(`file ${path} is not equal to '${content}'`);
    }
};
const fileDoesNotContain = (path, content) => {
    const file = fs.readFileSync(path, 'utf8');
    if (file.includes(content)) {
        throw new Error(`file ${path} contains '${content}', it should not`);
    }
};
const _stdout = { stdout }.stdout;
const _stderr = { stderr }.stderr;
let _inspect, _inspectE;
const spyOnConsole = () => {
    _inspect = _stdout.inspect();
    _inspectE = _stderr.inspect();
};
const restoreConsole = () => {
    _inspect.restore();
    _inspect.output.forEach(line => process.stdout.write(line));
    _inspect = null;
    _inspectE.restore();
    _inspectE.output.forEach(line => process.stderr.write(line));
    _inspectE = null;
};
const outputContains = msg => {
    if (typeof msg === 'string') {
        if (!_inspect.output.join('\n').includes(msg)) {
            throw new Error(`Expected console output (stdout) to contain '${msg}' but it didn't`);
        }
    }
    else if (!_inspect.output.some(line => msg.test(line))) {
        throw new Error(`Expected console output (stdout) to match '${msg}' but it didn't`);
    }
};
const outputDoesNotContain = msg => {
    if (_inspect.output.join('\n').includes(msg)) {
        throw new Error(`Expected console output (stdout) not to contain '${msg}' but it did`);
    }
};
const eOutputContains = msg => {
    if (!_inspectE.output.join('\n').includes(msg)) {
        throw new Error(`Expected console output (stderr) to contain '${msg}' but it didn't`);
    }
};
const eOutputDoesNotContain = msg => {
    if (_inspectE.output.join('\n').includes(msg)) {
        throw new Error(`Expected console output (stderr) not to contain '${msg}' but it did`);
    }
};
const noWarn = () => eOutputDoesNotContain('warn');
const noError = () => eOutputDoesNotContain('error');
const requestBrunchServer = (path, callback) => {
    const options = {
        host: 'localhost',
        port: 3333,
        path,
    };
    http.request(options, response => {
        let responseText = '';
        response.on('data', chunk => {
            responseText += chunk;
        });
        response.on('end', () => callback(responseText));
    }).end();
};
const npmInstall = callback => {
    cp.exec('npm install', callback);
};
export { prepareTestDir };
export { teardownTestDir };
export { fileExists };
export { fileDoesNotExist };
export { fileContains };
export { fileEquals };
export { fileDoesNotContain };
export { spyOnConsole };
export { restoreConsole };
export { outputContains };
export { outputDoesNotContain };
export { eOutputContains };
export { eOutputDoesNotContain };
export { noWarn };
export { noError };
export { requestBrunchServer };
export { npmInstall };
export default {
    prepareTestDir,
    teardownTestDir,
    fileExists,
    fileDoesNotExist,
    fileContains,
    fileEquals,
    fileDoesNotContain,
    spyOnConsole,
    restoreConsole,
    outputContains,
    outputDoesNotContain,
    eOutputContains,
    eOutputDoesNotContain,
    noWarn,
    noError,
    requestBrunchServer,
    npmInstall
};
