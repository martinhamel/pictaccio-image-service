"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingHandlerMiddleware = void 0;
const tslib_1 = require("tslib");
const routing_controllers_1 = require("@loufa/routing-controllers");
const typedi_1 = require("typedi");
const logger_1 = require("../../../lib/core/logger");
const logger_common_1 = require("../../../lib/core/logger_common");
let LoggingHandlerMiddleware = class LoggingHandlerMiddleware {
    use(request, response, next) {
        logger_1.logger.info(`Processing request ${request.url} from ${request.ip}`, {
            area: 'http',
            subarea: 'middlewares/logging',
            action: 'logging',
            data: {
                headers: request.headers,
                query: request.query,
                body: request.body
            },
            ...(0, logger_common_1.httpCommonFields)(request)
        });
        next();
    }
};
exports.LoggingHandlerMiddleware = LoggingHandlerMiddleware;
exports.LoggingHandlerMiddleware = LoggingHandlerMiddleware = tslib_1.__decorate([
    (0, typedi_1.Service)(),
    (0, routing_controllers_1.Middleware)({ type: 'before' })
], LoggingHandlerMiddleware);
//# sourceMappingURL=logging_middleware.js.map