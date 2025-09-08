"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = prefixPath;
const path_1 = require("path");
const typedi_1 = require("typedi");
const config = typedi_1.Container.get('config');
const prefixes = {
    css: config.server.dirs.public.css,
    img: config.server.dirs.public.img,
    script: config.server.dirs.public.script
};
function prefixPath(kind, path) {
    return (0, path_1.join)(prefixes[kind], path);
}
//# sourceMappingURL=prefix_path.js.map