import { Store } from 'express-session';
import { Inject, Service } from 'typedi';
import {
    AllCallback,
    ClearCallback,
    DestroyCallback,
    GetCallback,
    LengthCallback,
    SetCallback,
    StoreInterface,
    TouchCallback
} from '../../core/store_interface';
import { ConfigSchema } from '../../core/config_schema';
import { logger } from '../../lib/core/logger';
import { RedisService } from '../../lib/services/redis_service';

const PREFIX = 'pictaccio-backstore-';
const SESSION_PROPERTY = '_pictaccio';
const NOOP = () => {/*Pass*/ };

@Service('backstore')
export class BackStoreService extends Store implements StoreInterface {
    @Inject('config')
    private _config: ConfigSchema;

    @Inject('redis')
    private _redis: RedisService;

    /**
     * Return all sessions in the store
     * @param callback
     */
    public all(callback: AllCallback = NOOP): void {
        try {
            this._redis.scan(PREFIX + '*')
                .then((keys: string[]) => {
                    return this._redis.mget(keys);
                })
                .then((sessionsString) => {
                    logger.debug(`Getting all sessions`, {
                        area: 'services',
                        subarea: 'back-store',
                        action: 'user:get-session',
                        result: 'success'
                    });
                    callback(null, sessionsString.map(sessionString => JSON.parse(sessionString)));
                })
                .catch((error) => {
                    BackStoreService._errorCallback(error, callback);
                });
        } catch (error) {
            BackStoreService._errorCallback(error, callback);
        }
    }

    public clear(callback: ClearCallback = NOOP): void {
        try {
            this._redis.scan(PREFIX + '*')
                .then((keys: string[]) => {
                    return this._redis.del(keys);
                })
                .then(() => {
                    logger.debug(`Clearing all sessions`, {
                        area: 'services',
                        subarea: 'back-store',
                        action: 'user:delete-session',
                        result: 'success'
                    });
                    callback(null);
                })
                .catch((error) => {
                    BackStoreService._errorCallback(error, callback);
                })
        } catch (error) {
            BackStoreService._errorCallback(error, callback);
        }
    }

    public destroy(sessionId: string, callback: DestroyCallback = NOOP): void {
        try {
            this._redis.del(PREFIX + sessionId)
                .then(() => {
                    logger.debug(`Deleting session ${sessionId}`, {
                        area: 'services',
                        subarea: 'back-store',
                        action: 'user:delete-session',
                        result: 'success',
                        session_id: sessionId
                    });
                    callback(null);
                })
                .catch((error) => {
                    BackStoreService._errorCallback(error, callback);
                });
        } catch (error) {
            BackStoreService._errorCallback(error, callback);
        }
    }

    public get(sessionId: string, callback: GetCallback = NOOP): void {
        try {
            this._redis.get(PREFIX + sessionId)
                .then((sessionString) => {
                    const session = JSON.parse(sessionString);

                    logger.debug(`Getting session for ${sessionId}`, {
                        area: 'services',
                        subarea: 'back-store',
                        action: 'user:get-session',
                        result: 'success',
                        session_id: sessionId,
                        session
                    });
                    callback(null, session);
                })
                .catch((error) => {
                    BackStoreService._errorCallback(error, callback);
                });
        } catch (error) {
            BackStoreService._errorCallback(error, callback);
        }
    }

    public async init(): Promise<void> {
        await this._redis.ready();
    }

    public length(callback: LengthCallback = NOOP): void {
        try {
            this._redis.scan(PREFIX + '*')
                .then((keys: string[]) => {
                    logger.debug(`Counting number of sessions`, {
                        area: 'services',
                        subarea: 'back-store',
                        action: 'user:get-session',
                        result: 'success',
                        count: keys.length
                    });
                    callback(null, keys.length);
                })
                .catch((error) => {
                    BackStoreService._errorCallback(error, callback);
                });
        } catch (error) {
            BackStoreService._errorCallback(error, callback);
        }
    }

    public set(sessionId: string, session: any, callback: SetCallback = NOOP): void {
        this._resetTTL(session);

        try {
            this._redis.set(PREFIX + sessionId, JSON.stringify(session), this._getTTL(session))
                .then(() => {
                    logger.debug(`Getting session for ${sessionId}`, {
                        area: 'services',
                        subarea: 'back-store',
                        action: 'user:set-session',
                        result: 'success',
                        session_id: sessionId,
                        session
                    });
                    callback(null);
                })
                .catch((error) => {
                    BackStoreService._errorCallback(error, callback);
                });
        } catch (error) {
            BackStoreService._errorCallback(error, callback);
        }
    }

    public touch(sessionId: string, session: any, callback: TouchCallback = NOOP): void {
        try {
            this._redis.expire(PREFIX + sessionId, this._config.server.sessionTTL)
                .then(() => {
                    logger.debug(`Touching session for ${sessionId}`, {
                        area: 'services',
                        subarea: 'back-store',
                        action: 'user:touch-session',
                        result: 'success',
                        session_id: sessionId
                    });
                    callback(null)
                })
                .catch((error) => {
                    BackStoreService._errorCallback(error, callback);
                });
        } catch (error) {
            BackStoreService._errorCallback(error, callback);
        }
    }

    private static _errorCallback(error: any, callback: (error: string, _?: any) => void): void {
        const callerName: string = (new Error()).stack.split("\n")[2].trim().split(" ")[1];
        logger.error(`Error while executing ${callerName}`, {
            area: 'services',
            subarea: 'back-store',
            action: 'logging',
            caller_name: callerName,
            error
        });

        if (typeof error === 'string') {
            callback(error);
        } else {
            callback(`${error.name}: ${error.message}`);
        }
    }

    private _getTTL(session): number {
        if (session[SESSION_PROPERTY] === undefined) {
            this._resetTTL(session);
        }

        return session[SESSION_PROPERTY].expireAt - Math.ceil(Date.now() / 1000);
    }

    private _resetTTL(session): void {
        if (session[SESSION_PROPERTY] === undefined) {
            session[SESSION_PROPERTY] = {};
        }

        session[SESSION_PROPERTY].expireAt = Math.ceil(Date.now() / 1000) + this._config.server.sessionTTL;
    }
}
