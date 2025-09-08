"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandlerMiddleware = void 0;
const tslib_1 = require("tslib");
const routing_controllers_1 = require("@loufa/routing-controllers");
const typedi_1 = require("typedi");
const logger_1 = require("../../../lib/core/logger");
const logger_common_1 = require("../../../lib/core/logger_common");
let ErrorHandlerMiddleware = class ErrorHandlerMiddleware {
    error(error, request, response, next) {
        let accessError = false;
        if (error.code === 'ERR_HTTP_HEADERS_SENT') {
            next();
            return;
        }
        logger_1.logger.error(`Error while processing request from ${request.ip} for ${request.url}. ` +
            `Error: ${error.name} ${error.message}`, {
            error,
            area: 'http',
            subarea: 'middlewares/error-handler',
            action: 'logging',
            session_id: request.session.id,
            http_method: request.method,
            data: {
                headers: request.headers,
                query: request.query,
                body: request.body
            },
            ...(0, logger_common_1.httpCommonFields)(request)
        });
        if (error.name === 'AccessDeniedError') {
            accessError = true;
        }
        response.status(accessError ? 403 : (error.httpCode || 500));
        response.json({
            status: 'error',
            context: ['AccessDeniedError'].includes(error.name) ? error.name : 'UNKNOWN_ERROR',
            correlationId: request.correlationId
        });
        next();
    }
};
exports.ErrorHandlerMiddleware = ErrorHandlerMiddleware;
exports.ErrorHandlerMiddleware = ErrorHandlerMiddleware = tslib_1.__decorate([
    (0, typedi_1.Service)(),
    (0, routing_controllers_1.Middleware)({ type: 'after' })
], ErrorHandlerMiddleware);
//# sourceMappingURL=error_handler_middleware.js.map