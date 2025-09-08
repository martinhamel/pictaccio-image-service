"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingHandlerMiddleware = void 0;
const tslib_1 = require("tslib");
const crypto_1 = require("crypto");
const routing_controllers_1 = require("@loufa/routing-controllers");
const typedi_1 = require("typedi");
let LoggingHandlerMiddleware = class LoggingHandlerMiddleware {
    use(request, response, next) {
        request.correlationId = (0, crypto_1.randomUUID)();
        next();
    }
};
exports.LoggingHandlerMiddleware = LoggingHandlerMiddleware;
exports.LoggingHandlerMiddleware = LoggingHandlerMiddleware = tslib_1.__decorate([
    (0, typedi_1.Service)(),
    (0, routing_controllers_1.Middleware)({ type: 'before' })
], LoggingHandlerMiddleware);
//# sourceMappingURL=correlation_id_middleware.js.map