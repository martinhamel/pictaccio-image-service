"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeormLoader = void 0;
const typedi_1 = require("typedi");
const typeorm_1 = require("typeorm");
const logger_1 = require("../../lib/core/logger");
function installTypeormShims() {
    typeorm_1.SelectQueryBuilder.prototype.whereExists = function (query) {
        return this.where(`EXISTS (${query.getQuery()})`, query.getParameters());
    };
    typeorm_1.SelectQueryBuilder.prototype.andWhereExists = function (query) {
        return this.andWhere(`EXISTS (${query.getQuery()})`, query.getParameters());
    };
    typeorm_1.SelectQueryBuilder.prototype.orWhereExists = function (query) {
        return this.orWhere(`EXISTS (${query.getQuery()})`, query.getParameters());
    };
}
const typeormLoader = async () => {
    const config = typedi_1.Container.get('config');
    try {
        const connectionOptions = Object.assign({}, {
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
            await (0, typeorm_1.createConnection)(connectionOptions);
            logger_1.logger.info(`Connected to db`, {
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
        }
        catch (error) {
            logger_1.logger.error(`Failed to connect to db`, {
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
    }
    catch (error) {
        logger_1.logger.error(`Unknown db issue`, {
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
};
exports.typeormLoader = typeormLoader;
//# sourceMappingURL=typeorm.js.map