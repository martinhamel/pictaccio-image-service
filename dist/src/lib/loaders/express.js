"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressLoader = void 0;
const tslib_1 = require("tslib");
const crypto_1 = require("crypto");
const express_1 = tslib_1.__importStar(require("express"));
const express_fileupload_1 = tslib_1.__importDefault(require("express-fileupload"));
const express_session_1 = tslib_1.__importDefault(require("express-session"));
const typedi_1 = require("typedi");
const routing_controllers_1 = require("@loufa/routing-controllers");
const collection_1 = require("../../lib/core/collection");
const logger_1 = require("../../lib/core/logger");
const view_1 = require("../../lib/http/view/view");
require("../../lib/services/auth_service");
require("../../lib/services/back_store_service");
require("../../lib/services/redis_service");
const config_1 = require("../../config");
function makeOperationString(operation) {
    return (operation.indexOf('.') === -1
        ? operation += ':any'
        : operation.replace('.', ':'));
}
const expressLoader = async () => {
    const auth = typedi_1.Container.get('auth');
    const rbac = typedi_1.Container.has('rbac') ? typedi_1.Container.get('rbac') : undefined;
    const app = (0, express_1.default)();
    logger_1.logger.debug('Initializing express', {
        area: 'loaders',
        subarea: 'express',
        action: 'loading'
    });
    app.disable('x-powered-by');
    app.use(express_1.default.static(config_1.config.env.dirs.public));
    app.use((0, express_1.urlencoded)({ extended: true }));
    app.use((0, express_fileupload_1.default)({
        createParentPath: true,
        safeFileNames: true,
        preserveExtension: true,
        parseNested: true
    }));
    app.use((0, express_session_1.default)({
        secret: config_1.config.server.sessionSecret,
        resave: false,
        saveUninitialized: true,
        rolling: true,
        cookie: { secure: config_1.config.env.production },
        store: typedi_1.Container.get('backstore'),
        genid(request) {
            if (request.query['cookie']) {
                return request.query['cookie'];
            }
            return (0, crypto_1.randomUUID)();
        }
    }));
    (0, routing_controllers_1.useExpressServer)(app, {
        cors: true,
        classTransformer: true,
        routePrefix: config_1.config.server.prefix,
        defaultErrorHandler: false,
        viewClass: view_1.View,
        authorizationChecker: async (action, roles) => {
            const token = action.request.headers['authorization']?.substring(7);
            const user = await auth.userFromToken(token);
            if (!auth.validateAuthentication(token)) {
                logger_1.logger.info(`Checking authorization for resource '${roles.join(' ')}', but user isn't authenticated.`, {
                    area: 'loaders',
                    subarea: 'express',
                    action: 'user:checking-authorization',
                    result: 'failed',
                    context: 'not-authenticated',
                    resource_name: action.request.url,
                    src_user_email: user?.email,
                    src_user_id: user?.id,
                    src_user_roles: user?.roles,
                });
                return false;
            }
            if (user) {
                action.request.user = user;
                if (!roles.length) {
                    logger_1.logger.info(`Checking authorization, allowing because user is ` +
                        `authenticated and no roles were requested`, {
                        area: 'loaders',
                        subarea: 'express',
                        action: 'user:checking-authorization',
                        result: 'success',
                        context: 'authenticated-no-roles',
                        resource_name: action.request.url,
                        src_user_email: user?.email,
                        src_user_id: user?.id,
                        src_user_roles: user?.roles,
                    });
                    return true;
                }
                if (!rbac) {
                    logger_1.logger.info(`Checking authorization, allowing because user is but the RBAC services isn't loaded`, {
                        area: 'loaders',
                        subarea: 'express',
                        action: 'user:checking-authorization',
                        result: 'success',
                        context: 'has-roles-but-no-rbac',
                        resource_name: action.request.url,
                        src_user_email: user?.email,
                        src_user_id: user?.id,
                        src_user_roles: user?.roles,
                    });
                    return true;
                }
                const permissions = roles
                    .map(role => {
                    const [name, operation, resource] = role.split(':');
                    return { name, operation, resource };
                })
                    .filter(role => user.roles.includes(role.name))
                    .map(role => rbac.can(role.name, makeOperationString(role.operation), role.resource))
                    .filter(permission => permission.granted);
                const granted = permissions.length !== 0;
                action.request.permissions = permissions;
                if (granted) {
                    logger_1.logger.info(`Checking authorization, allowing because user is ` +
                        `authenticated and and their roles permits access to '${roles.join(' ')}'`, {
                        area: 'loaders',
                        subarea: 'express',
                        action: 'user:checking-authorization',
                        result: 'success',
                        context: 'has-permission',
                        resource_name: action.request.url,
                        src_user_email: user?.email,
                        src_user_id: user?.id,
                        src_user_roles: user?.roles,
                    });
                }
                else {
                    logger_1.logger.info(`Checking authorization, denying because user is ` +
                        `authenticated but their roles doesn't allow access to '${roles.join(' ')}'`, {
                        area: 'loaders',
                        subarea: 'express',
                        action: 'user:checking-authorization',
                        result: 'failed',
                        context: 'missing-permission',
                        resource_name: action.request.url,
                        src_user_email: user?.email,
                        src_user_id: user?.id,
                        src_user_roles: user?.roles,
                    });
                }
                return granted;
            }
            return false;
        },
        currentUserChecker: async (action) => {
            const token = action.request.headers['authorization']?.substring(7);
            return auth.userFromToken(token);
        },
        controllers: config_1.config.server.dirs.controllers,
        middlewares: config_1.config.server.dirs.middlewares,
        interceptors: config_1.config.server.dirs.interceptors,
    });
    (new collection_1.Collection(config_1.config.server.dirs.validators, { filter: /.*\.js$/ }))
        .on('ready', collection => collection.importAll());
    (new collection_1.Collection(config_1.config.server.dirs.decorators, { filter: /.*\.js$/ }))
        .on('ready', collection => collection.importAll());
    if (config_1.config.env.production) {
        app.set('trust proxy', 1);
    }
    logger_1.logger.info(`Listening on ${config_1.config.rpc.imageServiceServer.interface}:${config_1.config.rpc.imageServiceServer.listen}`, {
        area: 'loaders',
        subarea: 'express',
        action: 'http:listen',
        interface: config_1.config.rpc.imageServiceServer.interface,
        port: config_1.config.rpc.imageServiceServer.listen,
    });
    app.listen(config_1.config.rpc.imageServiceServer.listen, config_1.config.rpc.imageServiceServer.interface);
    typedi_1.Container.set('express.app', app);
};
exports.expressLoader = expressLoader;
//# sourceMappingURL=express.js.map