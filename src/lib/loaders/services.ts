import { Collection } from '../../lib/core/collection';
import path from 'path';
import { Container } from 'typedi';
import { ConfigSchema } from '../../core/config_schema';
import { LoaderInterface } from '../../lib/bootstrap';
import { logger } from '../../lib/core/logger';

const SERVICE_FILTER = /.*_service\.js$/;

export const servicesLoader: LoaderInterface = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        const config = Container.get('config') as ConfigSchema;

        logger.info(`Loading services...`, {
            area: 'loaders',
            subarea: 'services',
            action: 'loading'
        });

        // Load services
        (new Collection(config.server.dirs.services, { filter: SERVICE_FILTER }))
            .on('ready', async collection => {
                await collection.importAll();
                resolve();
            });
    });
}
