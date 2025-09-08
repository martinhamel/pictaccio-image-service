"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInfoService = void 0;
const tslib_1 = require("tslib");
const typedi_1 = require("typedi");
const public_user_1 = require("../../database/models/public_user");
const logger_1 = require("../../lib/core/logger");
const user_not_found_error_1 = require("../../lib/errors/user_not_found_error");
let UserInfoService = class UserInfoService {
    _config;
    constructor(_config) {
        this._config = _config;
    }
    async changeUserName(email, name) {
        logger_1.logger.info(`[UserInfoService] Changing username for ${email}...`, {
            area: 'services',
            subarea: 'userInfo',
            action: 'userInfo:edit-username',
            email
        });
        if (!await public_user_1.PublicUser.emailExists(email)) {
            logger_1.logger.warn(`[UserInfoService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'userInfo',
                action: 'userInfo:edit-username',
                result: 'failed',
                email
            });
            throw new user_not_found_error_1.UserNotFoundError(email);
        }
        const { id } = await public_user_1.PublicUser.findByEmail(email);
        await public_user_1.PublicUser.setUserInfo(id, { name: JSON.stringify(name) });
        logger_1.logger.info('[UserInfoService] ...success', {
            area: 'services',
            subarea: 'userInfo',
            action: 'userInfo:edit-username',
            result: 'success',
            email
        });
    }
    async readUserName(email) {
        logger_1.logger.info(`[UserInfoService] Reading username for ${email}...`, {
            area: 'services',
            subarea: 'userInfo',
            action: 'userInfo:read-username',
            email
        });
        if (!await public_user_1.PublicUser.emailExists(email)) {
            logger_1.logger.warn(`[UserInfoService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'userInfo',
                action: 'userInfo:read-username',
                result: 'failed',
                email
            });
            throw new user_not_found_error_1.UserNotFoundError(email);
        }
        const { id } = await public_user_1.PublicUser.findByEmail(email);
        const userInfo = await public_user_1.PublicUser.getUserInfo(id);
        const name = userInfo.name || null;
        logger_1.logger.info('[UserInfoService] ...success', {
            area: 'services',
            subarea: 'userInfo',
            action: 'userInfo:read-username',
            result: 'success',
            email
        });
        return name;
    }
};
exports.UserInfoService = UserInfoService;
exports.UserInfoService = UserInfoService = tslib_1.__decorate([
    (0, typedi_1.Service)('UserInfo'),
    tslib_1.__param(0, (0, typedi_1.Inject)('config')),
    tslib_1.__metadata("design:paramtypes", [Object])
], UserInfoService);
//# sourceMappingURL=user_info_service.js.map