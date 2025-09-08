"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.servicesLoader = void 0;
const collection_1 = require("../../lib/core/collection");
const typedi_1 = require("typedi");
const logger_1 = require("../../lib/core/logger");
const SERVICE_FILTER = /.*_service\.js$/;
const servicesLoader = () => {
    return new Promise((resolve, reject) => {
        const config = typedi_1.Container.get('config');
        logger_1.logger.info(`Loading services...`, {
            area: 'loaders',
            subarea: 'services',
            action: 'loading'
        });
        (new collection_1.Collection(config.server.dirs.services, { filter: SERVICE_FILTER }))
            .on('ready', async (collection) => {
            await collection.importAll();
            resolve();
        });
    });
};
exports.servicesLoader = servicesLoader;
//# sourceMappingURL=services.js.map