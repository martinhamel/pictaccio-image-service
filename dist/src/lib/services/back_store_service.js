"use strict";
var BackStoreService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackStoreService = void 0;
const tslib_1 = require("tslib");
const express_session_1 = require("express-session");
const typedi_1 = require("typedi");
const logger_1 = require("../../lib/core/logger");
const redis_service_1 = require("../../lib/services/redis_service");
const PREFIX = 'pictaccio-backstore-';
const SESSION_PROPERTY = '_pictaccio';
const NOOP = () => { };
let BackStoreService = BackStoreService_1 = class BackStoreService extends express_session_1.Store {
    _config;
    _redis;
    all(callback = NOOP) {
        try {
            this._redis.scan(PREFIX + '*')
                .then((keys) => {
                return this._redis.mget(keys);
            })
                .then((sessionsString) => {
                logger_1.logger.debug(`Getting all sessions`, {
                    area: 'services',
                    subarea: 'back-store',
                    action: 'user:get-session',
                    result: 'success'
                });
                callback(null, sessionsString.map(sessionString => JSON.parse(sessionString)));
            })
                .catch((error) => {
                BackStoreService_1._errorCallback(error, callback);
            });
        }
        catch (error) {
            BackStoreService_1._errorCallback(error, callback);
        }
    }
    clear(callback = NOOP) {
        try {
            this._redis.scan(PREFIX + '*')
                .then((keys) => {
                return this._redis.del(keys);
            })
                .then(() => {
                logger_1.logger.debug(`Clearing all sessions`, {
                    area: 'services',
                    subarea: 'back-store',
                    action: 'user:delete-session',
                    result: 'success'
                });
                callback(null);
            })
                .catch((error) => {
                BackStoreService_1._errorCallback(error, callback);
            });
        }
        catch (error) {
            BackStoreService_1._errorCallback(error, callback);
        }
    }
    destroy(sessionId, callback = NOOP) {
        try {
            this._redis.del(PREFIX + sessionId)
                .then(() => {
                logger_1.logger.debug(`Deleting session ${sessionId}`, {
                    area: 'services',
                    subarea: 'back-store',
                    action: 'user:delete-session',
                    result: 'success',
                    session_id: sessionId
                });
                callback(null);
            })
                .catch((error) => {
                BackStoreService_1._errorCallback(error, callback);
            });
        }
        catch (error) {
            BackStoreService_1._errorCallback(error, callback);
        }
    }
    get(sessionId, callback = NOOP) {
        try {
            this._redis.get(PREFIX + sessionId)
                .then((sessionString) => {
                const session = JSON.parse(sessionString);
                logger_1.logger.debug(`Getting session for ${sessionId}`, {
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
                BackStoreService_1._errorCallback(error, callback);
            });
        }
        catch (error) {
            BackStoreService_1._errorCallback(error, callback);
        }
    }
    async init() {
        await this._redis.ready();
    }
    length(callback = NOOP) {
        try {
            this._redis.scan(PREFIX + '*')
                .then((keys) => {
                logger_1.logger.debug(`Counting number of sessions`, {
                    area: 'services',
                    subarea: 'back-store',
                    action: 'user:get-session',
                    result: 'success',
                    count: keys.length
                });
                callback(null, keys.length);
            })
                .catch((error) => {
                BackStoreService_1._errorCallback(error, callback);
            });
        }
        catch (error) {
            BackStoreService_1._errorCallback(error, callback);
        }
    }
    set(sessionId, session, callback = NOOP) {
        this._resetTTL(session);
        try {
            this._redis.set(PREFIX + sessionId, JSON.stringify(session), this._getTTL(session))
                .then(() => {
                logger_1.logger.debug(`Getting session for ${sessionId}`, {
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
                BackStoreService_1._errorCallback(error, callback);
            });
        }
        catch (error) {
            BackStoreService_1._errorCallback(error, callback);
        }
    }
    touch(sessionId, session, callback = NOOP) {
        try {
            this._redis.expire(PREFIX + sessionId, this._config.server.sessionTTL)
                .then(() => {
                logger_1.logger.debug(`Touching session for ${sessionId}`, {
                    area: 'services',
                    subarea: 'back-store',
                    action: 'user:touch-session',
                    result: 'success',
                    session_id: sessionId
                });
                callback(null);
            })
                .catch((error) => {
                BackStoreService_1._errorCallback(error, callback);
            });
        }
        catch (error) {
            BackStoreService_1._errorCallback(error, callback);
        }
    }
    static _errorCallback(error, callback) {
        const callerName = (new Error()).stack.split("\n")[2].trim().split(" ")[1];
        logger_1.logger.error(`Error while executing ${callerName}`, {
            area: 'services',
            subarea: 'back-store',
            action: 'logging',
            caller_name: callerName,
            error
        });
        if (typeof error === 'string') {
            callback(error);
        }
        else {
            callback(`${error.name}: ${error.message}`);
        }
    }
    _getTTL(session) {
        if (session[SESSION_PROPERTY] === undefined) {
            this._resetTTL(session);
        }
        return session[SESSION_PROPERTY].expireAt - Math.ceil(Date.now() / 1000);
    }
    _resetTTL(session) {
        if (session[SESSION_PROPERTY] === undefined) {
            session[SESSION_PROPERTY] = {};
        }
        session[SESSION_PROPERTY].expireAt = Math.ceil(Date.now() / 1000) + this._config.server.sessionTTL;
    }
};
exports.BackStoreService = BackStoreService;
tslib_1.__decorate([
    (0, typedi_1.Inject)('config'),
    tslib_1.__metadata("design:type", Object)
], BackStoreService.prototype, "_config", void 0);
tslib_1.__decorate([
    (0, typedi_1.Inject)('redis'),
    tslib_1.__metadata("design:type", redis_service_1.RedisService)
], BackStoreService.prototype, "_redis", void 0);
exports.BackStoreService = BackStoreService = BackStoreService_1 = tslib_1.__decorate([
    (0, typedi_1.Service)('backstore')
], BackStoreService);
//# sourceMappingURL=back_store_service.js.map