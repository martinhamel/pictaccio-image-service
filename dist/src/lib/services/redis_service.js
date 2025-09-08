"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const tslib_1 = require("tslib");
const typedi_1 = require("typedi");
const redis_1 = require("redis");
const logger_1 = require("../../lib/core/logger");
const config_1 = require("../../config");
let RedisService = class RedisService {
    _config = config_1.config;
    _client;
    _readyPromise;
    constructor() {
        this._client = (0, redis_1.createClient)({
            socket: {
                host: this._config.redis.host,
                port: this._config.redis.port
            }
        });
        this._client.on('error', (error) => {
            logger_1.logger.error(`Redis error: ${error}`, {
                area: 'services',
                subarea: 'redis',
                action: 'logging',
                error
            });
        });
        logger_1.logger.info(`Connecting to redis`, {
            area: 'services',
            subarea: 'redis',
            action: 'connecting'
        });
        this._readyPromise = new Promise((resolve, reject) => {
            this._client.on('ready', (error) => {
                if (error) {
                    logger_1.logger.error(`Failled to connect to redis`, {
                        area: 'services',
                        subarea: 'redis',
                        action: 'connecting',
                        result: 'failed',
                        error
                    });
                    reject(error);
                }
                resolve();
            });
            logger_1.logger.info(`Connected to redis`, {
                area: 'services',
                subarea: 'redis',
                action: 'connecting',
                result: 'success'
            });
        });
        if (this._config.env.environment !== 'test') {
            this._client.connect();
        }
    }
    async del(key) {
        await this._client.del(key);
    }
    async expire(key, seconds) {
        await this._client.expire(key, seconds);
    }
    async get(key) {
        return await this._client.get(key);
    }
    async mget(keys) {
        return await this._client.mGet(keys);
    }
    async ready() {
        await this._readyPromise;
    }
    async scan(pattern) {
        return await this._client.scan(0, {
            MATCH: pattern
        });
    }
    scanIterator(pattern) {
        return this._client.scanIterator({
            MATCH: pattern
        });
    }
    async set(key, value, expire) {
        await this._client.set(key, value, {
            EX: expire
        });
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = tslib_1.__decorate([
    (0, typedi_1.Service)('redis'),
    tslib_1.__metadata("design:paramtypes", [])
], RedisService);
//# sourceMappingURL=redis_service.js.map