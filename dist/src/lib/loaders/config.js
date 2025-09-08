"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configLoader = void 0;
const typedi_1 = require("typedi");
const config_1 = require("../../config");
const logger_1 = require("../../lib/core/logger");
const configLoader = async () => {
    typedi_1.Container.set('config', config_1.config);
    logger_1.logger.debug(`Config loaded`, {
        area: 'loaders',
        subarea: 'config',
        action: 'loading',
        config: config_1.config
    });
    return Promise.resolve();
};
exports.configLoader = configLoader;
//# sourceMappingURL=config.js.map