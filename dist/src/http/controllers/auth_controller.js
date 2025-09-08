"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const tslib_1 = require("tslib");
const routing_controllers_1 = require("@loufa/routing-controllers");
const routing_controllers_openapi_1 = require("routing-controllers-openapi");
const typedi_1 = require("typedi");
const logger_1 = require("../../lib/core/logger");
const logger_common_1 = require("../../lib/core/logger_common");
const public_invite_1 = require("../../database/models/public_invite");
const public_user_1 = require("../../database/models/public_user");
const user_exist_error_1 = require("../../lib/errors/user_exist_error");
const user_not_found_error_1 = require("../../lib/errors/user_not_found_error");
const wrong_secret_error_1 = require("../../lib/errors/wrong_secret_error");
const wrong_totp_token_error_1 = require("../../lib/errors/wrong_totp_token_error");
const not_enabled_error_1 = require("../../lib/errors/not_enabled_error");
const create_account_request_1 = require("../../http/controllers/requests/create_account_request");
const create_account_response_1 = require("../../http/controllers/responses/create_account_response");
const complete_invite_response_1 = require("../../http/controllers/responses/complete_invite_response");
const complete_invite_request_1 = require("../../http/controllers/requests/complete_invite_request");
const complete_password_reset_request_1 = require("../../http/controllers/requests/complete_password_reset_request");
const complete_password_reset_response_1 = require("../../http/controllers/responses/complete_password_reset_response");
const edit_account_response_1 = require("../../http/controllers/responses/edit_account_response");
const edit_account_request_1 = require("../../http/controllers/requests/edit_account_request");
const login_request_1 = require("../../http/controllers/requests/login_request");
const initiate_invite_request_1 = require("../../http/controllers/requests/initiate_invite_request");
const initiate_invite_response_1 = require("../../http/controllers/responses/initiate_invite_response");
const initiate_password_reset_request_1 = require("../../http/controllers/requests/initiate_password_reset_request");
const initiate_password_reset_response_1 = require("../../http/controllers/responses/initiate_password_reset_response");
const invalid_reset_code_error_1 = require("../../lib/errors/invalid_reset_code_error");
const verify_authenticator_request_1 = require("../../http/controllers/requests/verify_authenticator_request");
const validate_reset_password_code_request_1 = require("../../http/controllers/requests/validate_reset_password_code_request");
const validate_reset_password_code_response_1 = require("../../http/controllers/responses/validate_reset_password_code_response");
const auth_service_1 = require("../../lib/services/auth_service");
const delete_account_response_1 = require("../../http/controllers/responses/delete_account_response");
const delete_account_request_1 = require("../../http/controllers/requests/delete_account_request");
let AuthController = class AuthController {
    _auth;
    _config;
    _mailer;
    constructor(_auth) {
        this._auth = _auth;
    }
    async changePassword(user, request, body) {
        try {
            await this._auth.changePassword(user.email.toLowerCase(), body.secret);
            return true;
        }
        catch (error) {
            logger_1.logger.error(`[AuthController] User ${user.email} failed to verify their password. Reason: ${error.message}`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:validate-password',
                controller_action: 'changePassword',
                email: user.email,
                error,
                ...(0, logger_common_1.httpCommonFields)(request)
            });
            return false;
        }
    }
    async createAccount(body, request, response) {
        try {
            const id = await this._auth.createLocal(body.email.toLowerCase(), body.secret, body.roles);
            const otpUri = await this._auth.resetTOTP(body.email.toLowerCase());
            logger_1.logger.info(`[AuthController] A user with email ${body.email} successfully created a new account`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:create',
                controller_action: 'createAccount',
                ...(0, logger_common_1.httpCommonFields)(request)
            });
            return {
                status: 'ok',
                id,
                otpUri
            };
        }
        catch (error) {
            logger_1.logger.error(`[AuthController] A user with email ${body.email} attempted to create a ` +
                `new account but the operation failed. Reason: ${error.message}`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:create',
                controller_action: 'createAccount',
                error,
                ...(0, logger_common_1.httpCommonFields)(request)
            });
            return {
                status: 'failed',
                context: 'UNKNOWN_FAILURE'
            };
        }
    }
    async completeInvite(body, request, response) {
        const invite = await public_invite_1.PublicInvite.findByToken(body.inviteToken);
        if (invite.email.toLowerCase() !== body.email.toLowerCase()) {
            logger_1.logger.error(`[AuthController] A user with email ${body.email} attempted to complete an invitation but ` +
                `the provided email address does not match our records`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:complete-invive',
                controller_action: 'completeInvite',
                ...(0, logger_common_1.httpCommonFields)(request)
            });
            response.statusCode = 400;
            return {
                status: 'failed',
                context: 'UNKNOWN_FAILURE'
            };
        }
        const { id, otpUri } = await this._auth.completeInvite(body.email.toLowerCase(), body.secret);
        logger_1.logger.info(`[AuthController] User ${body.email} successfully completed their invitation`, {
            area: 'http',
            subarea: 'controller/auth',
            action: 'user:complete-invive',
            controller_action: 'completeInvite',
            ...(0, logger_common_1.httpCommonFields)(request)
        });
        return {
            status: 'ok',
            id,
            otpUri
        };
    }
    async completePasswordReset(request, body) {
        try {
            await this._auth.completePasswordReset(body.email, body.resetToken, body.code, body.secret);
            logger_1.logger.info(`[AuthController] User ${body.email} successfully reset their password`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:complete-password-reset',
                controller_action: 'completePasswordReset',
                ...(0, logger_common_1.httpCommonFields)(request)
            });
            return {
                status: 'ok'
            };
        }
        catch (error) {
            logger_1.logger.error(`[AuthController] User ${body.email} attempted to complete a password reset but the ` +
                `operation failed. Reason: ${error.message}`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:complete-password-reset',
                controller_action: 'completePasswordReset',
                error,
                ...(0, logger_common_1.httpCommonFields)(request)
            });
            if (error instanceof invalid_reset_code_error_1.InvalidResetCodeError) {
                return {
                    status: 'failed',
                    context: 'INVALID_CODE'
                };
            }
            return {
                status: 'error',
                context: 'UNKNOWN_FAILURE'
            };
        }
    }
    async deleteAccount(user, body, request) {
        logger_1.logger.info(`[AuthController] User ${user.email} is deleting user id ${body.id}`, {
            area: 'http',
            subarea: 'controller/auth',
            action: 'user:delete',
            controller_action: 'deleteAccount',
            data: body,
            ...(0, logger_common_1.httpCommonFields)(request)
        });
        await this._auth.deleteUser(body.id);
        return {
            status: 'ok'
        };
    }
    async editAccount(user, body, request) {
        logger_1.logger.info(`[AuthController] User ${user.email} is editing user id ${body.id}`, {
            area: 'http',
            subarea: 'controller/auth',
            action: 'user:edit',
            controller_action: 'editAccount',
            data: body,
            ...(0, logger_common_1.httpCommonFields)(request)
        });
        if (body.roles) {
            await this._auth.setUserRoles(body.id, body.roles);
        }
        if (body.avatar || body.name) {
            await this._auth.setUserInfo(body.id, {
                avatar: body.avatar,
                name: body.name
            });
        }
        return {
            status: 'ok'
        };
    }
    async initiateInvite(user, body, request, response) {
        try {
            const id = await this._auth.initiateInviteLocal(body.email.toLowerCase(), body.roles);
            const inviteToken = await public_invite_1.PublicInvite.createInvite(id, body.email.toLowerCase());
            this._mailer.send({
                from: 'test@mail.com',
                to: body.email,
                subject: 'You have been invited',
                message: `inviteToken: ${inviteToken}`
            });
            logger_1.logger.info(`[AuthController] User ${user?.email} successfully invited ${body.email}.`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:initiate-invite',
                controller_action: 'initiateInvite',
                initiatingUser: user?.email,
                invitee: body.email,
                roles: body.roles,
                ...(0, logger_common_1.httpCommonFields)(request)
            });
            return {
                status: 'ok'
            };
        }
        catch (error) {
            logger_1.logger.error(`[AuthController] User ${user?.email} invited ${body.email} but failed. ` +
                `Reason: ${error.message}`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:initiate-invite',
                controller_action: 'initiateInvite',
                initiatingUserEmail: user?.email,
                inviteeEmail: body.email,
                roles: body.roles,
                error: error,
                ...(0, logger_common_1.httpCommonFields)(request)
            });
            response.statusCode = 400;
            if (error instanceof user_exist_error_1.UserExistError) {
                return {
                    status: 'failed',
                    context: 'USER_EXIST'
                };
            }
            else {
                return {
                    status: 'failed',
                    context: 'UNKNOWN_FAILURE'
                };
            }
        }
    }
    async initiatePasswordReset(request, query) {
        try {
            const { email } = await public_user_1.PublicUser.findByEmail(query.email);
            if (email) {
                const code = await this._auth.initiatePasswordReset(email);
                logger_1.logger.info(`[AuthController] Initiating a password reset for ${email}`, {
                    area: 'http',
                    subarea: 'controller/auth',
                    action: 'user:initiate-password-reset',
                    controller_action: 'initiatePasswordReset',
                    email,
                    ...(0, logger_common_1.httpCommonFields)(request)
                });
                this._mailer.send({
                    from: 'test@mail.com',
                    to: email,
                    subject: 'Password Reset',
                    message: `Code: ${code}`
                });
            }
            return {
                status: 'ok'
            };
        }
        catch (error) {
            logger_1.logger.error(`[AuthController] There was an error while initiating a password reset for ${query.email}.` +
                `Error: ${error.message}`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:initiate-password-reset',
                controller_action: 'initiatePasswordReset',
                email: query.email,
                error,
                ...(0, logger_common_1.httpCommonFields)(request)
            });
            return {
                status: 'error'
            };
        }
    }
    async login(body, request, response) {
        let token;
        try {
            token = await this._auth.authenticateLocal(body.email.toLowerCase(), body.secret, body.token);
        }
        catch (error) {
            if (error instanceof user_not_found_error_1.UserNotFoundError ||
                error instanceof wrong_secret_error_1.WrongSecretError ||
                error instanceof wrong_totp_token_error_1.WrongTOTPTokenError ||
                error instanceof not_enabled_error_1.NotEnabledError) {
                response.statusCode = 400;
                return {
                    status: 'failed',
                    context: 'USER_OR_PASS_OR_TOKEN_INCORRECT'
                };
            }
            else {
                logger_1.logger.error(`[AuthController] A user with email ${body.email} attempted to login but failed. ` +
                    `Reason: ${error.message}`, {
                    area: 'http',
                    subarea: 'controller/auth',
                    action: 'user:login',
                    loginType: 'local',
                    controller_action: 'login',
                    email: body.email,
                    error,
                    ...(0, logger_common_1.httpCommonFields)(request)
                });
                response.statusCode = 500;
                return {
                    status: 'error',
                    context: 'UNKNOWN_FAILURE'
                };
            }
        }
        logger_1.logger.info(`[AuthController] User ${body.email} successfully logged in`, {
            area: 'http',
            subarea: 'controller/auth',
            action: 'user:login',
            loginType: 'local',
            controller_action: 'login',
            email: body.email
        });
        return {
            status: 'ok',
            token
        };
    }
    async resetAuthenticator(user, request) {
        let otpUri;
        try {
            otpUri = await this._auth.resetTOTP(user.email.toLowerCase());
        }
        catch (error) {
            logger_1.logger.error(`[AuthController] User ${user.email} failed to reset their TOTP seed. Reason: ${error.message}`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:reset-authenticator',
                controller_action: 'resetAuthenticator',
                email: user.email,
                error,
                ...(0, logger_common_1.httpCommonFields)(request)
            });
            return {
                status: 'failed'
            };
        }
        logger_1.logger.info(`[AuthController] User ${user.email} successfully reset their TOPT seed`, {
            area: 'http',
            subarea: 'controller/auth',
            action: 'user:reset-authenticator',
            controller_action: 'resetAuthenticator',
            email: user.email,
            ...(0, logger_common_1.httpCommonFields)(request)
        });
        return {
            status: 'ok',
            otpUri
        };
    }
    async validatePassword(user, request, body) {
        let response;
        try {
            response = await this._auth.verifyPassword(user.email.toLowerCase(), body.secret);
        }
        catch (error) {
            logger_1.logger.error(`[AuthController] User ${user.email} failed to verify their password. Reason: ${error.message}`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:validate-password',
                controller_action: 'validatePassword',
                email: user.email,
                error,
                ...(0, logger_common_1.httpCommonFields)(request)
            });
            return {
                valid: false,
                status: 'failed'
            };
        }
        logger_1.logger.info(`[AuthController] User ${user.email} successfully verify their password`, {
            area: 'http',
            subarea: 'controller/auth',
            action: 'user:validate-password',
            controller_action: 'validatePassword',
            email: user.email,
            ...(0, logger_common_1.httpCommonFields)(request)
        });
        return {
            status: 'ok',
            valid: response
        };
    }
    async validateResetPasswordCode(request, query) {
        try {
            const result = await this._auth.checkPasswordResetCode(query.email, query.code);
            logger_1.logger.error(`[AuthController] A user with email ${query.email} validated their password reset code`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:validate-password-reset-code',
                controller_action: 'validateResetPasswordCode',
                email: query.email,
                ...(0, logger_common_1.httpCommonFields)(request)
            });
            return {
                status: result.valid ? 'ok' : 'failed',
                resetToken: result.valid ? result.resetToken : undefined
            };
        }
        catch (error) {
            logger_1.logger.error(`[AuthController] A user with email ${query.email} attempted to check password reset code ` +
                `${query.code}. Reason: ${error.message}`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:validate-password-reset-code',
                controller_action: 'validateResetPasswordCode',
                email: query.email,
                error,
                ...(0, logger_common_1.httpCommonFields)(request)
            });
            return {
                status: 'error',
                context: 'UNKNOWN_FAILURE'
            };
        }
    }
    async verifyAuthenticator(request, query) {
        const valid = await this._auth.validateAuthenticatorToken(query.email, query.token);
        logger_1.logger.error(`[AuthController] A user with email ${query.email} validated their password reset code`, {
            area: 'http',
            subarea: 'controller/auth',
            action: 'user:verify-authenticator-code',
            controller_action: 'verifyAuthenticator',
            email: query.email,
            ...(0, logger_common_1.httpCommonFields)(request)
        });
        return {
            status: valid ? 'ok' : 'failed',
        };
    }
    async readUserSessionInfo(user, request) {
        try {
            const response = await this._auth.readUserSessionInfo(user.email.toLowerCase());
            return {
                status: 'ok',
                content: response
            };
        }
        catch (error) {
            logger_1.logger.error(`[AuthController] User ${user.email} failed to read their session information. Reason: ${error.message}`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:user-session/read',
                controller_action: 'readUserSessionInfo',
                email: user.email,
                error,
                ...(0, logger_common_1.httpCommonFields)(request)
            });
            return {
                status: 'failed',
                content: null
            };
        }
    }
};
exports.AuthController = AuthController;
tslib_1.__decorate([
    (0, typedi_1.Inject)('config'),
    tslib_1.__metadata("design:type", Object)
], AuthController.prototype, "_config", void 0);
tslib_1.__decorate([
    (0, typedi_1.Inject)('mailer'),
    tslib_1.__metadata("design:type", Object)
], AuthController.prototype, "_mailer", void 0);
tslib_1.__decorate([
    (0, routing_controllers_1.Authorized)(),
    (0, routing_controllers_1.Post)('/change-password'),
    tslib_1.__param(0, (0, routing_controllers_1.CurrentUser)()),
    tslib_1.__param(1, (0, routing_controllers_1.Req)()),
    tslib_1.__param(2, (0, routing_controllers_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
tslib_1.__decorate([
    (0, routing_controllers_1.Post)('/create-account'),
    (0, routing_controllers_openapi_1.ResponseSchema)(create_account_response_1.CreateAccountResponse),
    tslib_1.__param(0, (0, routing_controllers_1.Body)()),
    tslib_1.__param(1, (0, routing_controllers_1.Req)()),
    tslib_1.__param(2, (0, routing_controllers_1.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [create_account_request_1.CreateAccountRequest, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "createAccount", null);
tslib_1.__decorate([
    (0, routing_controllers_1.Post)('/complete-invite'),
    (0, routing_controllers_openapi_1.ResponseSchema)(complete_invite_response_1.CompleteInviteResponse),
    tslib_1.__param(0, (0, routing_controllers_1.Body)()),
    tslib_1.__param(1, (0, routing_controllers_1.Req)()),
    tslib_1.__param(2, (0, routing_controllers_1.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [complete_invite_request_1.CompleteInviteRequest, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "completeInvite", null);
tslib_1.__decorate([
    (0, routing_controllers_1.Post)('/complete-password-reset'),
    (0, routing_controllers_openapi_1.ResponseSchema)(complete_password_reset_response_1.CompletePasswordResetResponse),
    tslib_1.__param(0, (0, routing_controllers_1.Req)()),
    tslib_1.__param(1, (0, routing_controllers_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, complete_password_reset_request_1.CompletePasswordResetRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "completePasswordReset", null);
tslib_1.__decorate([
    (0, routing_controllers_1.Authorized)('admin:delete:account'),
    (0, routing_controllers_1.Post)('/delete-account'),
    (0, routing_controllers_openapi_1.ResponseSchema)(delete_account_response_1.DeleteAccountResponse),
    tslib_1.__param(0, (0, routing_controllers_1.CurrentUser)()),
    tslib_1.__param(1, (0, routing_controllers_1.Body)()),
    tslib_1.__param(2, (0, routing_controllers_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, delete_account_request_1.DeleteAccountRequest, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "deleteAccount", null);
tslib_1.__decorate([
    (0, routing_controllers_1.Authorized)('admin:update:account'),
    (0, routing_controllers_1.Post)('/edit-account'),
    (0, routing_controllers_openapi_1.ResponseSchema)(edit_account_response_1.EditAccountResponse),
    tslib_1.__param(0, (0, routing_controllers_1.CurrentUser)()),
    tslib_1.__param(1, (0, routing_controllers_1.Body)()),
    tslib_1.__param(2, (0, routing_controllers_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, edit_account_request_1.EditAccountRequest, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "editAccount", null);
tslib_1.__decorate([
    (0, routing_controllers_1.Authorized)(),
    (0, routing_controllers_1.Post)('/initiate-invite'),
    (0, routing_controllers_openapi_1.ResponseSchema)(initiate_invite_response_1.InitiateInviteResponse),
    tslib_1.__param(0, (0, routing_controllers_1.CurrentUser)()),
    tslib_1.__param(1, (0, routing_controllers_1.Body)()),
    tslib_1.__param(2, (0, routing_controllers_1.Req)()),
    tslib_1.__param(3, (0, routing_controllers_1.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, initiate_invite_request_1.InitiateInviteRequest, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "initiateInvite", null);
tslib_1.__decorate([
    (0, routing_controllers_1.Get)('/initiate-password-reset'),
    (0, routing_controllers_openapi_1.ResponseSchema)(initiate_password_reset_response_1.InitiatePasswordResetResponse),
    tslib_1.__param(0, (0, routing_controllers_1.Req)()),
    tslib_1.__param(1, (0, routing_controllers_1.QueryParams)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, initiate_password_reset_request_1.InitiatePasswordResetRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "initiatePasswordReset", null);
tslib_1.__decorate([
    (0, routing_controllers_1.Post)('/login'),
    tslib_1.__param(0, (0, routing_controllers_1.Body)()),
    tslib_1.__param(1, (0, routing_controllers_1.Req)()),
    tslib_1.__param(2, (0, routing_controllers_1.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [login_request_1.LoginRequest, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
tslib_1.__decorate([
    (0, routing_controllers_1.Authorized)(),
    (0, routing_controllers_1.Post)('/reset-authenticator'),
    tslib_1.__param(0, (0, routing_controllers_1.CurrentUser)()),
    tslib_1.__param(1, (0, routing_controllers_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "resetAuthenticator", null);
tslib_1.__decorate([
    (0, routing_controllers_1.Authorized)(),
    (0, routing_controllers_1.Post)('/validate-password'),
    tslib_1.__param(0, (0, routing_controllers_1.CurrentUser)()),
    tslib_1.__param(1, (0, routing_controllers_1.Req)()),
    tslib_1.__param(2, (0, routing_controllers_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "validatePassword", null);
tslib_1.__decorate([
    (0, routing_controllers_1.Get)('/validate-reset-password-code'),
    (0, routing_controllers_openapi_1.ResponseSchema)(validate_reset_password_code_response_1.ValidateResetPasswordCodeResponse),
    tslib_1.__param(0, (0, routing_controllers_1.Req)()),
    tslib_1.__param(1, (0, routing_controllers_1.QueryParams)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, validate_reset_password_code_request_1.ValidateResetPasswordCodeRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "validateResetPasswordCode", null);
tslib_1.__decorate([
    (0, routing_controllers_1.Get)('/verify-authenticator'),
    tslib_1.__param(0, (0, routing_controllers_1.Req)()),
    tslib_1.__param(1, (0, routing_controllers_1.QueryParams)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, verify_authenticator_request_1.VerifyAuthenticatorRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "verifyAuthenticator", null);
tslib_1.__decorate([
    (0, routing_controllers_1.Authorized)(),
    (0, routing_controllers_1.Post)('/user-session/read'),
    tslib_1.__param(0, (0, routing_controllers_1.CurrentUser)()),
    tslib_1.__param(1, (0, routing_controllers_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "readUserSessionInfo", null);
exports.AuthController = AuthController = tslib_1.__decorate([
    (0, typedi_1.Service)(),
    (0, routing_controllers_1.JsonController)('/auth'),
    tslib_1.__param(0, (0, typedi_1.Inject)('auth')),
    tslib_1.__metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth_controller.js.map