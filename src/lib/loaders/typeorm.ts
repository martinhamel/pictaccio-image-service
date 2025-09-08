import { Container } from 'typedi';
import { createConnection, ConnectionOptions, SelectQueryBuilder } from 'typeorm';
import { ConfigSchema } from '../../core/config_schema';
import { LoaderInterface } from '../../lib/bootstrap';
import { logger } from '../../lib/core/logger';

declare module 'typeorm' {
    interface SelectQueryBuilder<Entity> {
        whereExists<T>(query: SelectQueryBuilder<T>): this;
        andWhereExists<T>(query: SelectQueryBuilder<T>): this;
        orWhereExists<T>(query: SelectQueryBuilder<T>): this;
    }
}

function installTypeormShims() {
    SelectQueryBuilder.prototype.whereExists = function (query: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
        return this.where(`EXISTS (${query.getQuery()})`, query.getParameters());
    };
    SelectQueryBuilder.prototype.andWhereExists = function (query: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
        return this.andWhere(`EXISTS (${query.getQuery()})`, query.getParameters());
    };
    SelectQueryBuilder.prototype.orWhereExists = function (query: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
        return this.orWhere(`EXISTS (${query.getQuery()})`, query.getParameters());
    };
}

export const typeormLoader: LoaderInterface = async (): Promise<any> => {
    const config = Container.get<ConfigSchema>('config');

    try {
        // @ts-ignore
        const connectionOptions: ConnectionOptions = Object.assign({}, {
            type: config.db.type,
            host: config.db.host,
            port: config.db.port,
            username: config.db.username,
            password: config.db.password,
            database: config.db.database,
            synchronize: config.db.synchronize,
            logging: config.db.logging,
            schema: config.db.schema,
            entities: config.db.entitiesDir,
            subscribers: config.db.subscribersDir,
            migrations: config.db.migrationsDir,
        });

        try {
            await createConnection(connectionOptions);
            logger.info(`Connected to db`, {
                area: 'loaders',
                subarea: 'typeorm',
                action: 'connecting',
                result: 'success',
                type: config.db.type,
                host: config.db.host,
                port: config.db.port,
                username: config.db.username,
                database: config.db.database,
            });
        } catch (error) {
            logger.error(`Failed to connect to db`, {
                area: 'loaders',
                subarea: 'typeorm',
                action: 'connecting',
                result: 'failed',
                type: config.db.type,
                host: config.db.host,
                port: config.db.port,
                username: config.db.username,
                database: config.db.database,
                error
            });
        }

        installTypeormShims();
    } catch (error) {
        logger.error(`Unknown db issue`, {
            area: 'loaders',
            subarea: 'typeorm',
            action: 'connecting',
            result: 'failed',
            type: config.db.type,
            host: config.db.host,
            port: config.db.port,
            username: config.db.username,
            database: config.db.database,
            error
        });
    }
}
