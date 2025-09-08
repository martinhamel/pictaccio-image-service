"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZNotFoundMiddleware = void 0;
const tslib_1 = require("tslib");
const routing_controllers_1 = require("@loufa/routing-controllers");
const fs_1 = require("fs");
const path_1 = require("path");
const typedi_1 = require("typedi");
const logger_1 = require("../../../lib/core/logger");
const logger_common_1 = require("../../../lib/core/logger_common");
let ZNotFoundMiddleware = class ZNotFoundMiddleware {
    _config;
    constructor(_config) {
        this._config = _config;
    }
    async use(request, response, next) {
        let isPublicFile = false;
        try {
            isPublicFile = await fs_1.promises.stat((0, path_1.join)(this._config.server.dirs.public.onDisk, request.url)) !== undefined;
        }
        catch (e) {
        }
        if (!isPublicFile && !response.headersSent) {
            logger_1.logger.error(`Not found error while processing request ${request.url} from ${request.ip} `, {
                area: 'http',
                subarea: 'middlewares/not-found',
                action: 'logging',
                session_id: request.session.id,
                data: {
                    headers: request.headers,
                    query: request.query,
                    body: request.body
                },
                ...(0, logger_common_1.httpCommonFields)(request)
            });
            response
                .status(404)
                .json({
                status: 'error',
                context: 'not-found',
                correlationId: request.correlationId
            });
            response.end();
        }
        else if (isPublicFile) {
            next();
        }
    }
};
exports.ZNotFoundMiddleware = ZNotFoundMiddleware;
exports.ZNotFoundMiddleware = ZNotFoundMiddleware = tslib_1.__decorate([
    (0, typedi_1.Service)(),
    (0, routing_controllers_1.Middleware)({ type: 'after' }),
    tslib_1.__param(0, (0, typedi_1.Inject)('config')),
    tslib_1.__metadata("design:paramtypes", [Object])
], ZNotFoundMiddleware);
//# sourceMappingURL=z_not_found_middleware.js.map