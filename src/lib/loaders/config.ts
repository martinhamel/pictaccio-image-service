import { Container } from 'typedi';
import { LoaderInterface } from '@pictaccio/image-service/src/lib/bootstrap';
import { config } from '@pictaccio/image-service/src/config';
import { logger } from '@pictaccio/image-service/src/lib/core/logger';

export const configLoader: LoaderInterface = async (): Promise<void> => {
    Container.set('config', config);

    logger.debug(`Config loaded`, {
        area: 'loaders',
        subarea: 'config',
        action: 'loading',
        config
    });

    return Promise.resolve();
}

