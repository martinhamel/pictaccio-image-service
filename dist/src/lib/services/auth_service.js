"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const tslib_1 = require("tslib");
const crypto_1 = require("crypto");
const jsonwebtoken_1 = require("jsonwebtoken");
const typedi_1 = require("typedi");
const otplib_1 = require("otplib");
const util_1 = require("util");
const public_reset_1 = require("../../database/models/public_reset");
const public_user_1 = require("../../database/models/public_user");
const logger_1 = require("../../lib/core/logger");
const invalid_reset_code_error_1 = require("../../lib/errors/invalid_reset_code_error");
const not_enabled_error_1 = require("../../lib/errors/not_enabled_error");
const user_exist_error_1 = require("../../lib/errors/user_exist_error");
const user_not_found_error_1 = require("../../lib/errors/user_not_found_error");
const wrong_secret_error_1 = require("../../lib/errors/wrong_secret_error");
const wrong_totp_token_error_1 = require("../../lib/errors/wrong_totp_token_error");
const CURRENT_REV = 1;
let AuthService = class AuthService {
    _config;
    async authenticateLocal(email, password, totpToken) {
        logger_1.logger.info(`[AuthService] Authenticating user ${email} locally...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:authenticate-local',
            email
        });
        this._config = typedi_1.Container.get('config');
        if (!await public_user_1.PublicUser.emailExists(email)) {
            logger_1.logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:authenticate-local',
                result: 'failed',
                context: 'user-not-found',
                email
            });
            throw new user_not_found_error_1.UserNotFoundError(email);
        }
        const { id, status, hash, salt, seed, rev } = (await public_user_1.PublicUser.findByEmail(email));
        switch (rev) {
            case 1:
                if (await this._hashRev1(salt + password, salt) !== hash) {
                    logger_1.logger.warn(`[AuthService] ...failed. Reason: User ${email} entered an incorrect password`, {
                        area: 'services',
                        subarea: 'auth',
                        action: 'auth:authenticate-local',
                        result: 'failed',
                        context: 'incorrect-password',
                        email
                    });
                    throw new wrong_secret_error_1.WrongSecretError(email);
                }
        }
        if (status !== public_user_1.UserStatus.Enabled) {
            logger_1.logger.warn(`[AuthService] ...failed. Reason: User ${email} isn't enabled`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:authenticate-local',
                result: 'failed',
                context: 'user-not-enabled',
                email
            });
            throw new not_enabled_error_1.NotEnabledError(email);
        }
        if (!otplib_1.authenticator.check(totpToken, seed)) {
            logger_1.logger.warn(`[AuthService] ...failed. Reason: User ${email} has failed totp test`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:authenticate-local',
                result: 'failed',
                context: 'incorrect-totp',
                email
            });
            throw new wrong_totp_token_error_1.WrongTOTPTokenError(email);
        }
        await public_user_1.PublicUser.setLastLogin(id);
        logger_1.logger.info(`[AuthService] ...success`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:authenticate-local',
            result: 'success',
            email
        });
        return await (0, util_1.promisify)(jsonwebtoken_1.sign)({ id, email }, this._config.auth.secret);
    }
    async checkPasswordResetCode(email, code) {
        logger_1.logger.info(`[AuthService] Checking password reset code for user ${email}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:check-password-reset-code',
            email
        });
        if (!await public_user_1.PublicUser.emailExists(email)) {
            logger_1.logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:check-password-reset-code',
                result: 'failed',
                email
            });
            throw new user_not_found_error_1.UserNotFoundError(email);
        }
        logger_1.logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:check-password-reset-code',
            result: 'success',
            email
        });
        return await public_reset_1.PublicReset.checkResetEntry(email, code);
    }
    async completeInvite(email, secret) {
        logger_1.logger.info(`[AuthService] Completing invite for ${email}`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:complete-invite',
            email
        });
        const { id } = await public_user_1.PublicUser.findByEmail(email);
        await this._setUserSecret(id, secret);
        await public_user_1.PublicUser.setStatus(id, public_user_1.UserStatus.Created);
        return {
            id,
            otpUri: await this.resetTOTP(email)
        };
    }
    async completePasswordReset(email, resetToken, code, secret) {
        logger_1.logger.info(`[AuthService] Completing password reset for user ${email}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:complete-password-reset',
            email
        });
        const { id } = await public_user_1.PublicUser.findByEmail(email);
        if (!await public_user_1.PublicUser.emailExists(email)) {
            logger_1.logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:complete-password-reset',
                result: 'failed',
                email
            });
            throw new user_not_found_error_1.UserNotFoundError(email);
        }
        if (!(await public_reset_1.PublicReset.checkResetEntry(email, code, resetToken)).valid) {
            logger_1.logger.warn(`[AuthService] ...failed. Reason: Incorrect reset code or token`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:complete-password-reset',
                result: 'failed',
                email
            });
            throw new invalid_reset_code_error_1.InvalidResetCodeError(email);
        }
        await public_reset_1.PublicReset.deleteFromResetToken(resetToken);
        logger_1.logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:complete-password-reset',
            result: 'success',
            email
        });
        await this._setUserSecret(id, secret);
    }
    async createLocal(email, secret, roles) {
        logger_1.logger.info(`[AuthService] Creating user ${email}...`);
        if (await public_user_1.PublicUser.emailExists(email)) {
            logger_1.logger.warn(`[AuthService] ...failed. Reason: User ${email} exist in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:create-local',
                result: 'failed',
                email
            });
            throw new user_exist_error_1.UserExistError(email);
        }
        const id = await public_user_1.PublicUser.createUser(email, public_user_1.UserStatus.Created, roles, CURRENT_REV);
        await this._setUserSecret(id, secret);
        await public_user_1.PublicUser.setStatus(id, public_user_1.UserStatus.Created);
        logger_1.logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:create-local',
            result: 'success',
            email
        });
        return id;
    }
    async deleteUser(id) {
        logger_1.logger.info(`[AuthService] Deleting user id ${id}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:delete-user',
            targetUserId: id
        });
        if (await public_user_1.PublicUser.deleteUser(id)) {
            logger_1.logger.info('[AuthService] ...success', {
                area: 'services',
                subarea: 'auth',
                action: 'auth:delete-user',
                result: 'success',
                targetUserId: id
            });
        }
        else {
            logger_1.logger.error(`[AuthService] Failed to delete user id ${id}`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:delete-user',
                result: 'failed',
                targetUserId: id
            });
        }
    }
    async enableUser(id, enabled) {
        logger_1.logger.info(`[AuthService] ${enabled ? 'Enabling ' : 'Disabling '} user id ${id}`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:enable-user',
            targetUserId: id,
            enabled
        });
        if (await public_user_1.PublicUser.enableUser(id, enabled)) {
            logger_1.logger.error(`[AuthService] Failed to ${enabled ? 'enable ' : 'disable '} user id ${id}`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:enable-user',
                result: 'failed',
                targetUserId: id,
                enabled
            });
        }
        else {
            logger_1.logger.info('[AuthService] ...success', {
                area: 'services',
                subarea: 'auth',
                action: 'auth:enable-user',
                result: 'success',
                targetUserId: id,
                enabled
            });
        }
    }
    async initiateInviteLocal(email, roles) {
        logger_1.logger.info(`[AuthService] Inviting ${email}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:initiate-invite-local',
            email
        });
        if (await public_user_1.PublicUser.emailExists(email)) {
            logger_1.logger.warn(`[AuthService] ...failed. Reason: User ${email} exist in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:initiate-invite-local',
                result: 'failed',
                email
            });
            throw new user_exist_error_1.UserExistError(email);
        }
        const id = await public_user_1.PublicUser.createUser(email, public_user_1.UserStatus.Invited, roles, CURRENT_REV);
        await public_user_1.PublicUser.setStatus(id, public_user_1.UserStatus.Invited);
        logger_1.logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:initiate-invite-local',
            result: 'success',
            email
        });
        return id;
    }
    async initiatePasswordReset(email) {
        logger_1.logger.info(`[AuthService] Initiating password reset for ${email}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:initiate-password-reset',
            email
        });
        if (!await public_user_1.PublicUser.emailExists(email)) {
            logger_1.logger.warn(`[AuthService] ...failed. Reason: User doesn't exist in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:initiate-password-reset',
                result: 'failed',
                email
            });
            throw new user_not_found_error_1.UserNotFoundError(email);
        }
        const { id } = await public_user_1.PublicUser.findByEmail(email);
        const code = this._generateResetPasswordCode();
        public_reset_1.PublicReset.createResetEntry(id, email, code);
        logger_1.logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:initiate-password-reset',
            result: 'success',
            email
        });
        return code;
    }
    async resetTOTP(email) {
        logger_1.logger.info(`[AuthService] Resetting TOTP for ${email}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:reset-totp',
            email
        });
        if (!await public_user_1.PublicUser.emailExists(email)) {
            logger_1.logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:reset-totp',
                result: 'failed',
                email
            });
            throw new user_not_found_error_1.UserNotFoundError(email);
        }
        const seed = otplib_1.authenticator.generateSecret();
        const otpUrl = otplib_1.authenticator.keyuri(email, 'Pictaccio', seed);
        const { id } = await public_user_1.PublicUser.findByEmail(email);
        await public_user_1.PublicUser.setUserSeed(id, seed);
        await public_user_1.PublicUser.setStatus(id, public_user_1.UserStatus.Enabled);
        logger_1.logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:reset-totp',
            result: 'success',
            email
        });
        return otpUrl;
    }
    async verifyPassword(email, secret) {
        logger_1.logger.info(`[AuthService] verifying password for ${email}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:verify-password',
            email
        });
        if (!await public_user_1.PublicUser.emailExists(email)) {
            logger_1.logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:verify-password',
                result: 'failed',
                email
            });
            throw new user_not_found_error_1.UserNotFoundError(email);
        }
        let result = false;
        const { id, status, hash, salt, seed, rev } = (await public_user_1.PublicUser.findByEmail(email));
        if (await this._hashRev1(salt + secret, salt) !== hash) {
            logger_1.logger.warn(`[AuthService] ...failed. Reason: User ${email} entered an incorrect password`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:verify-secret',
                result: 'failed',
                context: 'incorrect-password',
                email
            });
            result = false;
            throw new wrong_secret_error_1.WrongSecretError(email);
        }
        else {
            result = true;
        }
        logger_1.logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:verify-password',
            result: 'success',
            email
        });
        return result;
    }
    async changePassword(email, secret) {
        logger_1.logger.info(`[AuthService] changing password for ${email}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:change-password',
            email
        });
        if (!await public_user_1.PublicUser.emailExists(email)) {
            logger_1.logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:change-password',
                result: 'failed',
                email
            });
            throw new user_not_found_error_1.UserNotFoundError(email);
        }
        const { id, status, hash, salt, seed, rev } = (await public_user_1.PublicUser.findByEmail(email));
        const newHash = await this._hashRev1(salt + secret, salt);
        await public_user_1.PublicUser.setUserHashAndSalt(id, newHash, salt);
        logger_1.logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:change-password',
            result: 'success',
            email
        });
    }
    async userFromToken(token) {
        try {
            const decoded = await (0, util_1.promisify)(jsonwebtoken_1.verify)(token, this._config.auth.secret, {});
            return decoded.id ? await this._userAsInterface(decoded.id) : null;
        }
        catch (e) {
            return null;
        }
    }
    async validateAuthentication(token) {
        try {
            await (0, util_1.promisify)(jsonwebtoken_1.verify)(token, this._config.auth.secret, {});
        }
        catch (e) {
            return false;
        }
        return true;
    }
    async validateAuthenticatorToken(email, totpToken) {
        const { seed } = (await public_user_1.PublicUser.findByEmail(email));
        return otplib_1.authenticator.check(totpToken, seed);
    }
    async setUserInfo(id, info) {
        logger_1.logger.info(`[AuthService] Changing user id ${id} info...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:set-user-info',
            data: info
        });
        await public_user_1.PublicUser.setUserInfo(id, info);
        logger_1.logger.info(`[AuthService] ... success`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:set-user-info',
            result: 'success'
        });
    }
    async setUserRoles(id, roles) {
        logger_1.logger.info(`[AuthService] Changing user id ${id} roles...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:set-user-roles',
            roles
        });
        await public_user_1.PublicUser.setUserRoles(id, roles);
        logger_1.logger.info(`[AuthService] ... success`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:set-user-info',
            result: 'success'
        });
    }
    _generateResetPasswordCode() {
        return parseInt((0, crypto_1.randomBytes)(4).toString('hex'), 16).toString().substring(0, 8);
    }
    async _setUserSecret(id, secret) {
        const salt = this._saltRev1();
        const hash = await this._hashRev1(salt + secret, salt);
        await public_user_1.PublicUser.setUserHashAndSalt(id, hash, salt);
    }
    async _hashRev1(secret, salt) {
        return (await (0, util_1.promisify)(crypto_1.pbkdf2)(secret, salt, 100000, 64, 'sha512')).toString('hex');
    }
    _saltRev1() {
        return (0, crypto_1.randomBytes)(64).toString('hex');
    }
    async _userAsInterface(id) {
        const user = await public_user_1.PublicUser.findOne({ where: { id } });
        const propTransforms = [
            { name: 'id', newName: 'id', transformer: value => value },
            { name: 'status', newName: 'status', transformer: value => value },
            { name: 'email', newName: 'email', transformer: value => value },
            { name: 'roles', newName: 'roles', transformer: value => value },
            { name: 'info', newName: 'info', transformer: value => value },
            { name: 'created', newName: 'created', transformer: value => value },
            { name: 'last_login', newName: 'lastLogin', transformer: value => value },
        ];
        return propTransforms.reduce((newUser, transform) => {
            newUser[transform.newName] = transform.transformer(user[transform.name]);
            return newUser;
        }, {});
    }
    async readUserSessionInfo(email) {
        logger_1.logger.info(`[AuthService] reading user session info for ${email}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:user-session/read',
            email
        });
        if (!await public_user_1.PublicUser.emailExists(email)) {
            logger_1.logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:user-session/read',
                result: 'failed',
                email
            });
            throw new user_not_found_error_1.UserNotFoundError(email);
        }
        const { id, status, hash, salt, seed, rev, roles_json, info_json, created, last_login } = (await public_user_1.PublicUser.findByEmail(email));
        const userSession = {
            email: email,
            roles: roles_json,
            created: created,
            lastLogin: last_login
        };
        logger_1.logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:user-session/read',
            result: 'success',
            email
        });
        return userSession;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = tslib_1.__decorate([
    (0, typedi_1.Service)('auth')
], AuthService);
//# sourceMappingURL=auth_service.js.map