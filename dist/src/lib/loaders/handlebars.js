"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlebarsLoader = void 0;
const express_handlebars_1 = require("express-handlebars");
const handlebars_1 = require("handlebars");
const typedi_1 = require("typedi");
const collection_1 = require("../../lib/core/collection");
const handlebarsLoader = async () => {
    const config = typedi_1.Container.get('config');
    const app = typedi_1.Container.get('express.app');
    const handlebars = (0, handlebars_1.create)();
    const handlebarsExpress = (0, express_handlebars_1.create)({ handlebars });
    (new collection_1.Collection(config.server.dirs.helpers, { filter: /\.js$/ }))
        .on('ready', collection => collection.importAll())
        .on('imported-all', collection => collection.execEach(({ obj }) => handlebars.registerHelper(obj.name, obj)));
    app.engine('handlebars', handlebarsExpress.engine);
    app.set('view engine', 'handlebars');
    app.set('views', config.server.dirs.templates);
};
exports.handlebarsLoader = handlebarsLoader;
//# sourceMappingURL=handlebars.js.map