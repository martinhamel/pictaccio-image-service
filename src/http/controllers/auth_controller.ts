import { Response } from 'express';
import { Authorized, Body, CurrentUser, Get, JsonController, QueryParams, Post, Req, Res } from '@loufa/routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';
import { Inject, Service } from 'typedi';
import { ConfigSchema } from '../../core/config_schema';
import { logger } from '../../lib/core/logger';
import { httpCommonFields } from '../../lib/core/logger_common';
import { Request } from '../../lib/core/request';
import { MailerInterface } from '../../core/mailer_interface';
import { UserInterface } from '../../core/user_interface';
import { PublicInvite } from '../../database/models/public_invite';
import { PublicUser } from '../../database/models/public_user';
import { UserExistError } from '../../lib/errors/user_exist_error';
import { UserNotFoundError } from '../../lib/errors/user_not_found_error';
import { WrongSecretError } from '../../lib/errors/wrong_secret_error';
import { WrongTOTPTokenError } from '../../lib/errors/wrong_totp_token_error';
import { NotEnabledError } from '../../lib/errors/not_enabled_error';
import { CreateAccountRequest } from '../../http/controllers/requests/create_account_request';
import { CreateAccountResponse } from '../../http/controllers/responses/create_account_response';
import { CompleteInviteResponse } from '../../http/controllers/responses/complete_invite_response';
import { CompleteInviteRequest } from '../../http/controllers/requests/complete_invite_request';
import { CompletePasswordResetRequest } from '../../http/controllers/requests/complete_password_reset_request';
import { CompletePasswordResetResponse } from '../../http/controllers/responses/complete_password_reset_response';
import { EditAccountResponse } from '../../http/controllers/responses/edit_account_response';
import { EditAccountRequest } from '../../http/controllers/requests/edit_account_request';
import { LoginRequest } from '../../http/controllers/requests/login_request';
import { InitiateInviteRequest } from '../../http/controllers/requests/initiate_invite_request';
import { InitiateInviteResponse } from '../../http/controllers/responses/initiate_invite_response';
import { InitiatePasswordResetRequest } from '../../http/controllers/requests/initiate_password_reset_request';
import { InitiatePasswordResetResponse } from '../../http/controllers/responses/initiate_password_reset_response';
import { InvalidResetCodeError } from '../../lib/errors/invalid_reset_code_error';
import { LoginResponse } from '../../http/controllers/responses/login_response';
import { VerifyAuthenticatorResponse } from '../../http/controllers/responses/verify_authenticator_response';
import { VerifyAuthenticatorRequest } from '../../http/controllers/requests/verify_authenticator_request';
import { ValidateResetPasswordCodeRequest } from '../../http/controllers/requests/validate_reset_password_code_request';
import { ValidateResetPasswordCodeResponse } from '../../http/controllers/responses/validate_reset_password_code_response';
import { ResetAuthenticatorResponse } from '../../http/controllers/responses/reset_authenticator_respponse';
import { AuthService } from '../../lib/services/auth_service';
import { DeleteAccountResponse } from '../../http/controllers/responses/delete_account_response';
import { DeleteAccountRequest } from '../../http/controllers/requests/delete_account_request';


@Service()
@JsonController('/auth')
export class AuthController {
    @Inject('config')
    private _config: ConfigSchema;

    @Inject('mailer')
    private _mailer: MailerInterface;

    constructor(@Inject('auth') private _auth: AuthService) {
    }

    @Authorized()
    @Post('/change-password')
    public async changePassword(@CurrentUser() user: UserInterface,
        @Req() request: Request,
        @Body() body: { secret: string }): Promise<boolean> {
        try {
            await this._auth.changePassword(user.email.toLowerCase(), body.secret);
            return true;
        } catch (error) {
            logger.error(`[AuthController] User ${user.email} failed to verify their password. Reason: ${error.message}`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:validate-password',
                controller_action: 'changePassword',
                email: user.email,
                error,
                ...httpCommonFields(request)
            });
            return false;
        }
    }

    @Post('/create-account')
    @ResponseSchema(CreateAccountResponse)
    public async createAccount(@Body() body: CreateAccountRequest,
        @Req() request: Request,
        @Res() response: Response): Promise<CreateAccountResponse> {

        try {
            const id = await this._auth.createLocal(body.email.toLowerCase(), body.secret, body.roles);
            const otpUri = await this._auth.resetTOTP(body.email.toLowerCase());

            logger.info(`[AuthController] A user with email ${body.email} successfully created a new account`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:create',
                controller_action: 'createAccount',
                ...httpCommonFields(request)
            });

            return {
                status: 'ok',
                id,
                otpUri
            };
        } catch (error) {
            logger.error(`[AuthController] A user with email ${body.email} attempted to create a ` +
                `new account but the operation failed. Reason: ${error.message}`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:create',
                controller_action: 'createAccount',
                error,
                ...httpCommonFields(request)
            });

            // Don't differentiate between UserNotFoundError or other kind of error,
            // just return a generic status: failed
            return {
                status: 'failed',
                context: 'UNKNOWN_FAILURE'
            }
        }
    }

    @Post('/complete-invite')
    @ResponseSchema(CompleteInviteResponse)
    public async completeInvite(@Body() body: CompleteInviteRequest,
        @Req() request: Request,
        @Res() response: Response): Promise<CompleteInviteResponse> {

        const invite = await PublicInvite.findByToken(body.inviteToken);

        if (invite.email.toLowerCase() !== body.email.toLowerCase()) {
            logger.error(`[AuthController] A user with email ${body.email} attempted to complete an invitation but ` +
                `the provided email address does not match our records`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:complete-invive',
                controller_action: 'completeInvite',
                ...httpCommonFields(request)
            })

            response.statusCode = 400;
            return {
                status: 'failed',
                context: 'UNKNOWN_FAILURE'
            }
        }

        const { id, otpUri } = await this._auth.completeInvite(body.email.toLowerCase(), body.secret);

        logger.info(`[AuthController] User ${body.email} successfully completed their invitation`, {
            area: 'http',
            subarea: 'controller/auth',
            action: 'user:complete-invive',
            controller_action: 'completeInvite',
            ...httpCommonFields(request)
        });
        return {
            status: 'ok',
            id,
            otpUri
        }
    }

    @Post('/complete-password-reset')
    @ResponseSchema(CompletePasswordResetResponse)
    public async completePasswordReset(
        @Req() request: Request,
        @Body() body: CompletePasswordResetRequest): Promise<CompletePasswordResetResponse> {

        try {
            await this._auth.completePasswordReset(body.email, body.resetToken, body.code, body.secret);

            logger.info(`[AuthController] User ${body.email} successfully reset their password`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:complete-password-reset',
                controller_action: 'completePasswordReset',
                ...httpCommonFields(request)
            });

            return {
                status: 'ok'
            };
        } catch (error) {
            logger.error(`[AuthController] User ${body.email} attempted to complete a password reset but the ` +
                `operation failed. Reason: ${error.message}`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:complete-password-reset',
                controller_action: 'completePasswordReset',
                error,
                ...httpCommonFields(request)
            });

            if (error instanceof InvalidResetCodeError) {
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

    @Authorized('admin:delete:account')
    @Post('/delete-account')
    @ResponseSchema(DeleteAccountResponse)
    public async deleteAccount(@CurrentUser() user,
        @Body() body: DeleteAccountRequest,
        @Req() request: Request): Promise<DeleteAccountResponse> {
        logger.info(`[AuthController] User ${user.email} is deleting user id ${body.id}`, {
            area: 'http',
            subarea: 'controller/auth',
            action: 'user:delete',
            controller_action: 'deleteAccount',
            data: body,
            ...httpCommonFields(request)
        });

        await this._auth.deleteUser(body.id);

        return {
            status: 'ok'
        };
    }

    @Authorized('admin:update:account')
    @Post('/edit-account')
    @ResponseSchema(EditAccountResponse)
    public async editAccount(@CurrentUser() user,
        @Body() body: EditAccountRequest,
        @Req() request: Request): Promise<EditAccountResponse> {
        logger.info(`[AuthController] User ${user.email} is editing user id ${body.id}`, {
            area: 'http',
            subarea: 'controller/auth',
            action: 'user:edit',
            controller_action: 'editAccount',
            data: body,
            ...httpCommonFields(request)
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

    @Authorized()
    @Post('/initiate-invite')
    @ResponseSchema(InitiateInviteResponse)
    public async initiateInvite(@CurrentUser() user,
        @Body() body: InitiateInviteRequest,
        @Req() request: Request,
        @Res() response: Response): Promise<InitiateInviteResponse> {
        try {
            const id = await this._auth.initiateInviteLocal(body.email.toLowerCase(), body.roles);
            const inviteToken = await PublicInvite.createInvite(id, body.email.toLowerCase());

            this._mailer.send({
                from: 'test@mail.com',
                to: body.email,
                subject: 'You have been invited', // TODO: i18n this
                message: `inviteToken: ${inviteToken}`
            });

            logger.info(`[AuthController] User ${user?.email} successfully invited ${body.email}.`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:initiate-invite',
                controller_action: 'initiateInvite',
                initiatingUser: user?.email,
                invitee: body.email,
                roles: body.roles,
                ...httpCommonFields(request)
            });

            return {
                status: 'ok'
            }
        } catch (error) {
            logger.error(`[AuthController] User ${user?.email} invited ${body.email} but failed. ` +
                `Reason: ${error.message}`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:initiate-invite',
                controller_action: 'initiateInvite',
                initiatingUserEmail: user?.email,
                inviteeEmail: body.email,
                roles: body.roles,
                error: error,
                ...httpCommonFields(request)
            });

            response.statusCode = 400;
            if (error instanceof UserExistError) {
                return {
                    status: 'failed',
                    context: 'USER_EXIST'
                }
            } else {
                return {
                    status: 'failed',
                    context: 'UNKNOWN_FAILURE'
                }
            }
        }
    }

    @Get('/initiate-password-reset')
    @ResponseSchema(InitiatePasswordResetResponse)
    public async initiatePasswordReset(
        @Req() request: Request,
        @QueryParams() query: InitiatePasswordResetRequest): Promise<InitiatePasswordResetResponse> {

        try {
            const { email } = await PublicUser.findByEmail(query.email);

            if (email) {
                const code = await this._auth.initiatePasswordReset(email);

                logger.info(`[AuthController] Initiating a password reset for ${email}`, {
                    area: 'http',
                    subarea: 'controller/auth',
                    action: 'user:initiate-password-reset',
                    controller_action: 'initiatePasswordReset',
                    email,
                    ...httpCommonFields(request)
                });

                this._mailer.send({
                    from: 'test@mail.com',
                    to: email,
                    subject: 'Password Reset', // TODO: i18n this
                    message: `Code: ${code}`
                });
                // TODO: Check if the email was successfully sent
            }

            return {
                status: 'ok'
            };
        } catch (error) {
            logger.error(`[AuthController] There was an error while initiating a password reset for ${query.email}.` +
                `Error: ${error.message}`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:initiate-password-reset',
                controller_action: 'initiatePasswordReset',
                email: query.email,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'error'
            };
        }
    }

    @Post('/login')
    public async login(@Body() body: LoginRequest,
        @Req() request: Request,
        @Res() response: Response): Promise<LoginResponse> {
        let token: string;

        try {
            token = await this._auth.authenticateLocal(body.email.toLowerCase(), body.secret, body.token);
        } catch (error) {
            if (error instanceof UserNotFoundError ||
                error instanceof WrongSecretError ||
                error instanceof WrongTOTPTokenError ||
                error instanceof NotEnabledError) {

                response.statusCode = 400;
                return {
                    status: 'failed',
                    context: 'USER_OR_PASS_OR_TOKEN_INCORRECT'
                };
            } else {
                logger.error(`[AuthController] A user with email ${body.email} attempted to login but failed. ` +
                    `Reason: ${error.message}`, {
                    area: 'http',
                    subarea: 'controller/auth',
                    action: 'user:login',
                    loginType: 'local',
                    controller_action: 'login',
                    email: body.email,
                    error,
                    ...httpCommonFields(request)
                });

                response.statusCode = 500;
                return {
                    status: 'error',
                    context: 'UNKNOWN_FAILURE'
                };
            }
        }

        logger.info(`[AuthController] User ${body.email} successfully logged in`, {
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
        }
    }

    @Authorized()
    @Post('/reset-authenticator')
    public async resetAuthenticator(@CurrentUser() user: UserInterface,
        @Req() request: Request): Promise<ResetAuthenticatorResponse> {

        let otpUri: string;

        try {
            otpUri = await this._auth.resetTOTP(user.email.toLowerCase());
        } catch (error) {
            logger.error(`[AuthController] User ${user.email} failed to reset their TOTP seed. Reason: ${error.message}`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:reset-authenticator',
                controller_action: 'resetAuthenticator',
                email: user.email,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'failed'
            };
        }

        logger.info(`[AuthController] User ${user.email} successfully reset their TOPT seed`, {
            area: 'http',
            subarea: 'controller/auth',
            action: 'user:reset-authenticator',
            controller_action: 'resetAuthenticator',
            email: user.email,
            ...httpCommonFields(request)
        });

        return {
            status: 'ok',
            otpUri
        };
    }

    @Authorized()
    @Post('/validate-password')
    public async validatePassword(@CurrentUser() user: UserInterface,
        @Req() request: Request,
        @Body() body: { secret: string }): Promise<{ status: string, valid: boolean }> {
        let response;
        try {
            response = await this._auth.verifyPassword(user.email.toLowerCase(), body.secret);
        } catch (error) {
            logger.error(`[AuthController] User ${user.email} failed to verify their password. Reason: ${error.message}`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:validate-password',
                controller_action: 'validatePassword',
                email: user.email,
                error,
                ...httpCommonFields(request)
            });

            return {
                valid: false,
                status: 'failed'
            };
        }

        logger.info(`[AuthController] User ${user.email} successfully verify their password`, {
            area: 'http',
            subarea: 'controller/auth',
            action: 'user:validate-password',
            controller_action: 'validatePassword',
            email: user.email,
            ...httpCommonFields(request)
        });

        return {
            status: 'ok',
            valid: response
        };
    }

    @Get('/validate-reset-password-code')
    @ResponseSchema(ValidateResetPasswordCodeResponse)
    public async validateResetPasswordCode(
        @Req() request: Request,
        @QueryParams() query: ValidateResetPasswordCodeRequest): Promise<ValidateResetPasswordCodeResponse> {

        try {
            const result = await this._auth.checkPasswordResetCode(query.email, query.code);

            logger.error(`[AuthController] A user with email ${query.email} validated their password reset code`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:validate-password-reset-code',
                controller_action: 'validateResetPasswordCode',
                email: query.email,
                ...httpCommonFields(request)
            });

            return {
                status: result.valid ? 'ok' : 'failed',
                resetToken: result.valid ? result.resetToken : undefined
            }
        } catch (error) {
            logger.error(`[AuthController] A user with email ${query.email} attempted to check password reset code ` +
                `${query.code}. Reason: ${error.message}`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:validate-password-reset-code',
                controller_action: 'validateResetPasswordCode',
                email: query.email,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'error',
                context: 'UNKNOWN_FAILURE'
            }
        }
    }

    @Get('/verify-authenticator')
    public async verifyAuthenticator(
        @Req() request: Request,
        @QueryParams() query: VerifyAuthenticatorRequest): Promise<VerifyAuthenticatorResponse> {
        const valid = await this._auth.validateAuthenticatorToken(query.email, query.token);

        logger.error(`[AuthController] A user with email ${query.email} validated their password reset code`, {
            area: 'http',
            subarea: 'controller/auth',
            action: 'user:verify-authenticator-code',
            controller_action: 'verifyAuthenticator',
            email: query.email,
            ...httpCommonFields(request)
        });

        return {
            status: valid ? 'ok' : 'failed',
        };
    }

    @Authorized()
    @Post('/user-session/read')
    public async readUserSessionInfo(@CurrentUser() user: UserInterface,
        @Req() request: Request): Promise<{ status: string, content: any }> {
        try {
            const response = await this._auth.readUserSessionInfo(user.email.toLowerCase());
            return {
                status: 'ok',
                content: response
            };
        } catch (error) {
            logger.error(`[AuthController] User ${user.email} failed to read their session information. Reason: ${error.message}`, {
                area: 'http',
                subarea: 'controller/auth',
                action: 'user:user-session/read',
                controller_action: 'readUserSessionInfo',
                email: user.email,
                error,
                ...httpCommonFields(request)
            });

            return {
                status: 'failed',
                content: null
            };
        }
    }
}
