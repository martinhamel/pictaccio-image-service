import { Inject, Service } from 'typedi';
import { createClient } from 'redis';
import { RedisClientType } from '@node-redis/client';
import { ConfigSchema } from '../../core/config_schema';
import { logger } from '../../lib/core/logger';
import { config } from '../../config';

@Service('redis')
export class RedisService {
    //@Inject('config')
    private _config: ConfigSchema = config as ConfigSchema;

    private _client: RedisClientType;
    private readonly _readyPromise: Promise<void>;

    constructor() {
        // @ts-ignore
        this._client = createClient({
            socket: {
                host: this._config.redis.host,
                port: this._config.redis.port
            }
        });

        this._client.on('error', (error) => {
            logger.error(`Redis error: ${error}`, {
                area: 'services',
                subarea: 'redis',
                action: 'logging',
                error
            });
        });

        logger.info(`Connecting to redis`, {
            area: 'services',
            subarea: 'redis',
            action: 'connecting'
        });
        this._readyPromise = new Promise<void>((resolve, reject) => {
            this._client.on('ready', (error) => {
                if (error) {
                    logger.error(`Failled to connect to redis`, {
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
            logger.info(`Connected to redis`, {
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

    public async del(key: string | string[]): Promise<void> {
        await this._client.del(key);
    }

    public async expire(key: string, seconds: number): Promise<void> {
        await this._client.expire(key, seconds);
    }

    public async get(key: string): Promise<string> {
        return await this._client.get(key);
    }

    public async mget(keys: string[]): Promise<string[]> {
        return await this._client.mGet(keys);
    }

    public async ready(): Promise<void> {
        await this._readyPromise;
    }

    public async scan(pattern?: string): Promise<any> {
        return await this._client.scan(0, {
            MATCH: pattern
        });
    }

    public scanIterator(pattern?: string): AsyncIterable<string> {
        return this._client.scanIterator({
            MATCH: pattern
        });
    }

    public async set(key: string, value: string, expire?: number): Promise<void> {
        await this._client.set(key, value, {
            EX: expire
        });
    }
}
