"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicLoader = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const typedi_1 = require("typedi");
const publicLoader = async () => {
    const config = typedi_1.Container.get('config');
    const app = typedi_1.Container.get('express.app');
    app.use(express_1.default.static(config.server.dirs.public.onDisk));
};
exports.publicLoader = publicLoader;
//# sourceMappingURL=public.js.map