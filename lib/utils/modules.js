import sysPath from "universal-path";
import commonRequireDefinition from "commonjs-require-definition";
'use strict';
const getWrapperFn = wrapper => {
    switch (wrapper) {
        case 'commonjs':
            return name => ({
                prefix: `require.register("${name}", function(exports, require, module) {\n`,
                suffix: '});\n\n',
            });
        case false:
            return (name, data) => data;
    }
    return wrapper;
};
const normalizeResult = wrapper => (name, data) => {
    const wrapped = wrapper(name, data);
    if (typeof wrapped === 'string') {
        const srcIndex = wrapped.indexOf(data);
        return {
            prefix: wrapped.slice(0, srcIndex),
            data: srcIndex > 0 ? data : wrapped,
            suffix: wrapped.slice(srcIndex + data.length),
        };
    }
    return {
        prefix: wrapped.prefix || '',
        data: wrapped.data || data,
        suffix: wrapped.suffix || '',
    };
};
export const normalizeWrapper = (wrapper, nameCleaner) => {
    const wrapperFn = normalizeResult(getWrapperFn(wrapper));
    return (path, compiled) => {
        const name = sysPath.normalize(path).replace(/^(\.\.\/)+/, '');
        return wrapperFn(nameCleaner(name), compiled);
    };
};
export const normalizeDefinition = definition => {
    switch (definition) {
        case 'commonjs':
            return () => commonRequireDefinition;
        case false:
            return () => '';
    }
    return definition;
};
