"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("reflect-metadata");
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
dotenv_1.default.config();
const bootstrap_1 = require("./lib/bootstrap");
const logger_1 = require("./lib/core/logger");
function exitHandler(kind, exitCode, error) {
    switch (kind) {
        case 'SIGINT':
        case 'SIGUSR1':
        case 'SIGUSR2':
            logger_1.logger.info(`Application received ${exitCode}`, { area: 'MAIN', action: 'exiting', reason: exitCode });
            process.exit(0);
            break;
        case 'uncaught-exception':
            logger_1.logger.error('Uncaught exception, application closing.', {
                ...error,
                area: 'MAIN',
                action: 'exiting',
                reason: 'uncaught-exception',
                error
            });
            break;
        default:
            logger_1.logger.info(`Application closing with exit code ${exitCode}`, {
                area: 'MAIN',
                action: 'exiting',
                reason: exitCode
            });
    }
}
logger_1.logger.info(`Pictaccio starting ...`, { area: 'MAIN' });
(0, bootstrap_1.onExit)(exitHandler);
const config_1 = require("./lib/loaders/config");
const grpc_1 = require("./lib/loaders/grpc");
const express_1 = require("./lib/loaders/express");
const i18next_1 = require("./lib/loaders/i18next");
const handlebars_1 = require("./lib/loaders/handlebars");
const public_1 = require("./lib/loaders/public");
const typedi_1 = require("./lib/loaders/typedi");
const services_1 = require("./lib/loaders/services");
const typeorm_1 = require("./lib/loaders/typeorm");
const scheduler_1 = require("./lib/loaders/scheduler");
const sharp_1 = require("sharp");
(0, bootstrap_1.bootstrap)([
    typedi_1.typediLoader,
    config_1.configLoader,
    i18next_1.i18nextLoader,
    scheduler_1.schedulerLoader,
    grpc_1.grpcLoader,
    services_1.servicesLoader,
    express_1.expressLoader,
    public_1.publicLoader,
    handlebars_1.handlebarsLoader,
    typeorm_1.typeormLoader
])
    .then(() => {
    (0, sharp_1.cache)(false);
    logger_1.logger.info('... Application started successfully', { area: 'MAIN' });
})
    .catch((error) => {
    logger_1.logger.error('An error occurred', { area: 'MAIN', message: error.message, stack: error.stack });
});
//# sourceMappingURL=entry.js.map