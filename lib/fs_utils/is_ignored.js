import { basename } from "universal-path";
'use strict';
// RegExps that filter out invalid files (dotfiles, emacs caches etc).
const apacheRe = /\.(?!htaccess|rewrite)/;
const dotfilesRe = /(^[.#]|(?:__|~)$)/;
export default path => {
    const name = basename(path);
    return apacheRe.test(name) && dotfilesRe.test(name);
};
