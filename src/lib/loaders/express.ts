import { randomUUID } from 'crypto';
import express, { urlencoded } from 'express';
import fileUploads from 'express-fileupload';
import session from 'express-session';
/*import { promises as fsPromises } from 'fs';
import { createServer } from '../../https';*/
import { Container } from 'typedi';
import { Action, useExpressServer } from '@loufa/routing-controllers';
import { ConfigSchema } from '../../core/config_schema';
import { UserInterface } from '../../core/user_interface';
import { LoaderInterface } from '../../lib/bootstrap';
import { Collection } from '../../lib/core/collection';
import { logger } from '../../lib/core/logger';
import { View } from '../../lib/http/view/view';
import '../../lib/services/auth_service';
import { AuthService } from '../../lib/services/auth_service';
import '../../lib/services/back_store_service';
import '../../lib/services/redis_service';
import type { RbacService } from '../../lib/services/rbac_service';
import { config } from '../../config';

type Operation = 'create:any' | 'read:any' | 'update:any' | 'delete:any' |
    'create:own' | 'read:own' | 'update:own' | 'delete:own';

function makeOperationString(operation: string): Operation {
    return (operation.indexOf('.') === -1
        ? operation += ':any'
        : operation.replace('.', ':')) as Operation;
}

export const expressLoader: LoaderInterface = async (): Promise<any> => {
    const auth: AuthService = Container.get('auth');
    const rbac: RbacService = Container.has('rbac') ? Container.get('rbac') : undefined;
    const app = express();
    /*const server = createServer({
        key: await fsPromises.readFile('../test.key'),
        cert: await fsPromises.readFile('../test.crt')
    }, app);*/
    //const router = Router();

    logger.debug('Initializing express', {
        area: 'loaders',
        subarea: 'express',
        action: 'loading'
    });

    app.disable('x-powered-by');

    // Load middlewares
    app.use(express.static(config.env.dirs.public))
    app.use(urlencoded({ extended: true }));
    app.use(fileUploads({
        createParentPath: true,
        safeFileNames: true,
        preserveExtension: true,
        parseNested: true
    }));

    app.use(session({
        secret: config.server.sessionSecret,
        resave: false,
        saveUninitialized: true,
        rolling: true,
        cookie: { secure: config.env.production },
        store: Container.get('backstore'),
        genid(request: express.Request): string {
            if (request.query['cookie']) {
                return request.query['cookie'] as string;
            }

            return randomUUID();
        }
    }));
    //app.use(json);

    useExpressServer(app, {
        cors: true,
        classTransformer: true,
        routePrefix: config.server.prefix,
        defaultErrorHandler: false,
        viewClass: View,

        authorizationChecker: async (action: Action, roles: string[]): Promise<boolean> => {
            const token = action.request.headers['authorization']?.substring(7);
            const user = await auth.userFromToken(token);

            if (!auth.validateAuthentication(token)) {
                logger.info(`Checking authorization for resource '${roles.join(' ')}', but user isn't authenticated.`, {
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
                    logger.info(`Checking authorization, allowing because user is ` +
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
                    logger.info(`Checking authorization, allowing because user is but the RBAC services isn't loaded`, {
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
                    logger.info(`Checking authorization, allowing because user is ` +
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
                } else {
                    logger.info(`Checking authorization, denying because user is ` +
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

        currentUserChecker: async (action: Action): Promise<UserInterface> => {
            const token = action.request.headers['authorization']?.substring(7);

            return auth.userFromToken(token);
        },

        controllers: config.server.dirs.controllers,
        middlewares: config.server.dirs.middlewares,
        interceptors: config.server.dirs.interceptors,
    });

    // Load validators
    (new Collection(config.server.dirs.validators, { filter: /.*\.js$/ }))
        .on('ready', collection => collection.importAll());

    // Load decorators
    (new Collection(config.server.dirs.decorators, { filter: /.*\.js$/ }))
        .on('ready', collection => collection.importAll());

    // Load production settings
    if (config.env.production) {
        app.set('trust proxy', 1);
    }

    logger.info(`Listening on ${config.rpc.imageServiceServer.interface}:${config.rpc.imageServiceServer.listen}`, {
        area: 'loaders',
        subarea: 'express',
        action: 'http:listen',
        interface: config.rpc.imageServiceServer.interface,
        port: config.rpc.imageServiceServer.listen,
    });
    app.listen(config.rpc.imageServiceServer.listen, config.rpc.imageServiceServer.interface);

    Container.set('express.app', app);
}
