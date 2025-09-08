"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const config_1 = require("../../config");
const http_collector_transport_1 = require("../../lib/core/http_collector_transport");
const node_os_1 = require("node:os");
const winston_1 = require("winston");
class Logger {
    _logger;
    constructor(logFilePath) {
        this._logger = (0, winston_1.createLogger)({
            format: winston_1.format.combine(winston_1.format.simple(), winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })),
            transports: [
                new winston_1.transports.Console(),
                new winston_1.transports.File({
                    filename: logFilePath
                }),
            ]
        });
        if (false && config_1.config.env.instanceId) {
            this._logger.add(new http_collector_transport_1.HttpCollectorTransport({
                host: config_1.config.app.logging.httpHost,
                port: config_1.config.app.logging.httpPort,
                token: config_1.config.app.logging.httpToken,
                level: 'debug'
            }));
        }
        if (!config_1.config.env.production && config_1.config.env.environment !== 'test') {
            this._logger.add(new winston_1.transports.Console({
                format: winston_1.format.combine(winston_1.format.simple(), winston_1.format.timestamp()),
                level: 'debug'
            }));
        }
        else {
            this._logger.add(new winston_1.transports.Console({
                format: winston_1.format.combine(winston_1.format.simple(), winston_1.format.timestamp()),
                level: 'info'
            }));
        }
    }
    debug(message, extended) {
        this._log(message, 'debug', extended);
    }
    error(message, extended) {
        this._log(message, 'error', extended);
    }
    info(message, extended) {
        this._log(message, 'info', extended);
    }
    warn(message, extended) {
        this._log(message, 'warn', extended);
    }
    _log(message, level, extended) {
        this._logger[level](message, {
            ...extended,
            app: config_1.config.app.name,
            app_instance: (0, node_os_1.hostname)(),
            app_version: config_1.config.env.version,
        });
    }
}
exports.logger = new Logger('log/image-service.log');
//# sourceMappingURL=logger.js.map