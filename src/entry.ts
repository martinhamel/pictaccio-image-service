import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import { bootstrap, onExit } from './lib/bootstrap';
import { logger } from './lib/core/logger';

function exitHandler(kind: string, exitCode: number | string, error: Error): void {
    switch (kind) {
        case 'SIGINT':
        case 'SIGUSR1':
        case 'SIGUSR2':
            logger.info(`Application received ${exitCode}`, { area: 'MAIN', action: 'exiting', reason: exitCode });
            process.exit(0);
            break;

        case 'uncaught-exception':
            logger.error('Uncaught exception, application closing.', {
                ...error,
                area: 'MAIN',
                action: 'exiting',
                reason: 'uncaught-exception',
                error
            });
            //process.exit(1);
            break;

        default:
            logger.info(`Application closing with exit code ${exitCode}`, {
                area: 'MAIN',
                action: 'exiting',
                reason: exitCode
            });
    }
}

logger.info(`Pictaccio starting ...`, { area: 'MAIN' });
onExit(exitHandler);


/*
 * Load the app's modules
 */
import { configLoader } from './lib/loaders/config';
import { grpcLoader } from './lib/loaders/grpc';
import { expressLoader } from './lib/loaders/express';
import { i18nextLoader } from './lib/loaders/i18next';
import { handlebarsLoader } from './lib/loaders/handlebars';
import { publicLoader } from './lib/loaders/public';
import { typediLoader } from './lib/loaders/typedi';
import { servicesLoader } from './lib/loaders/services';
import { typeormLoader } from './lib/loaders/typeorm';
import { schedulerLoader } from './lib/loaders/scheduler';
import { cache } from 'sharp';

bootstrap([
    typediLoader,
    configLoader,
    i18nextLoader,
    schedulerLoader,
    grpcLoader,
    servicesLoader,
    expressLoader,
    publicLoader,
    handlebarsLoader,
    typeormLoader
])
    .then(() => {
        cache(false);

        logger.info('... Application started successfully', { area: 'MAIN' });
    })
    .catch((error) => {
        logger.error('An error occurred', { area: 'MAIN', message: error.message, stack: error.stack });
    });

