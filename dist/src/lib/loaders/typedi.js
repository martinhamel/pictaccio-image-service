"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typediLoader = void 0;
const typeorm_1 = require("typeorm");
const routing_controllers_1 = require("@loufa/routing-controllers");
const typedi_1 = require("typedi");
const typeorm_typedi_extensions_1 = require("typeorm-typedi-extensions");
const typediLoader = async () => {
    (0, typeorm_1.useContainer)(typeorm_typedi_extensions_1.Container);
    (0, routing_controllers_1.useContainer)(typedi_1.Container);
};
exports.typediLoader = typediLoader;
//# sourceMappingURL=typedi.js.map