import { TokenData } from '@pictaccio/shared/types/token_data';
import { pbkdf2, randomBytes } from 'crypto';
import { Secret, sign, verify, VerifyOptions } from 'jsonwebtoken';
import { Service, Container } from 'typedi';
import { authenticator } from 'otplib';
import { promisify } from 'util';
import { ConfigSchema } from '../../core/config_schema';
import { UserInterface } from '../../core/user_interface';
import { PublicReset } from '../../database/models/public_reset';
import { PublicUser, UserInfo, UserStatus } from '../../database/models/public_user';
import { logger } from '../../lib/core/logger';
import { InvalidResetCodeError } from '../../lib/errors/invalid_reset_code_error';
import { NotEnabledError } from '../../lib/errors/not_enabled_error';
import { UserExistError } from '../../lib/errors/user_exist_error';
import { UserNotFoundError } from '../../lib/errors/user_not_found_error';
import { WrongSecretError } from '../../lib/errors/wrong_secret_error';
import { WrongTOTPTokenError } from '../../lib/errors/wrong_totp_token_error';

const CURRENT_REV = 1;

@Service('auth')
export class AuthService {

    _config: ConfigSchema;

    /**
     * Authenticate a user against the local database
     * @param email Email address of the user
     * @param password The password
     * @param totpToken The one-time authenticator key
     */
    public async authenticateLocal(email: string, password: string, totpToken: string): Promise<string> {
        logger.info(`[AuthService] Authenticating user ${email} locally...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:authenticate-local',
            email
        });

        this._config = Container.get<ConfigSchema>('config');



        // Check if user exist...
        if (!await PublicUser.emailExists(email)) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:authenticate-local',
                result: 'failed',
                context: 'user-not-found',
                email
            });
            throw new UserNotFoundError(email);
        }

        // Check if password is correct...
        const { id, status, hash, salt, seed, rev } = (await PublicUser.findByEmail(email));
        switch (rev) {
            case 1:
                if (await this._hashRev1(salt + password, salt) !== hash) {
                    logger.warn(`[AuthService] ...failed. Reason: User ${email} entered an incorrect password`, {
                        area: 'services',
                        subarea: 'auth',
                        action: 'auth:authenticate-local',
                        result: 'failed',
                        context: 'incorrect-password',
                        email
                    });
                    throw new WrongSecretError(email);
                }
        }

        if (status !== UserStatus.Enabled) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} isn't enabled`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:authenticate-local',
                result: 'failed',
                context: 'user-not-enabled',
                email
            });
            throw new NotEnabledError(email);
        }

        // Check if TOTP is correct...
        if (!authenticator.check(totpToken, seed)) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} has failed totp test`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:authenticate-local',
                result: 'failed',
                context: 'incorrect-totp',
                email
            });
            throw new WrongTOTPTokenError(email);
        }

        await PublicUser.setLastLogin(id);

        logger.info(`[AuthService] ...success`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:authenticate-local',
            result: 'success',
            email
        });
        return await promisify<TokenData, string, string>(sign)({ id, email }, this._config.auth.secret);
    }

    /**
     * Check if a password reset code is valid and not expired for a given email address
     * @param email The email address
     * @param code The code to verify
     */
    public async checkPasswordResetCode(email: string, code: string): Promise<{ valid: boolean, resetToken: string }> {
        logger.info(`[AuthService] Checking password reset code for user ${email}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:check-password-reset-code',
            email
        });

        // Check if user exist...
        if (!await PublicUser.emailExists(email)) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:check-password-reset-code',
                result: 'failed',
                email
            });
            throw new UserNotFoundError(email);
        }

        logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:check-password-reset-code',
            result: 'success',
            email
        });
        return await PublicReset.checkResetEntry(email, code);
    }

    /**
     * Complete the invite process
     * @param email The email
     * @param secret The secret
     */
    public async completeInvite(email: string, secret: string): Promise<{ id: string, otpUri: string }> {
        logger.info(`[AuthService] Completing invite for ${email}`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:complete-invite',
            email
        });

        const { id } = await PublicUser.findByEmail(email);
        await this._setUserSecret(id, secret);
        await PublicUser.setStatus(id, UserStatus.Created);

        return {
            id,
            otpUri: await this.resetTOTP(email)
        };
    }

    /**
     * Complete a password request. The operation will success if the code and resetToken match our record
     * @param email The email address to reset the password for
     * @param resetToken The reset token
     * @param code The code
     * @param secret The secret
     */
    public async completePasswordReset(
        email: string, resetToken: string, code: string, secret: string): Promise<void> {

        logger.info(`[AuthService] Completing password reset for user ${email}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:complete-password-reset',
            email
        });

        const { id } = await PublicUser.findByEmail(email);

        // Check if user exist...
        if (!await PublicUser.emailExists(email)) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:complete-password-reset',
                result: 'failed',
                email
            });
            throw new UserNotFoundError(email);
        }

        if (!(await PublicReset.checkResetEntry(email, code, resetToken)).valid) {
            logger.warn(`[AuthService] ...failed. Reason: Incorrect reset code or token`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:complete-password-reset',
                result: 'failed',
                email
            });
            throw new InvalidResetCodeError(email);
        }

        await PublicReset.deleteFromResetToken(resetToken);

        logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:complete-password-reset',
            result: 'success',
            email
        });
        await this._setUserSecret(id, secret);
    }

    /**
     * Create a user in the local db
     * @param email Email of the user
     * @param secret The secret
     * @param roles The roles the user has
     */
    public async createLocal(email: string, secret: string, roles: string[]): Promise<string> {
        logger.info(`[AuthService] Creating user ${email}...`);

        // Check if user exist...
        if (await PublicUser.emailExists(email)) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} exist in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:create-local',
                result: 'failed',
                email
            });
            throw new UserExistError(email);
        }

        // Create user
        const id = await PublicUser.createUser(email, UserStatus.Created, roles, CURRENT_REV);
        await this._setUserSecret(id, secret);
        await PublicUser.setStatus(id, UserStatus.Created);

        // At this point the user can't be logged into until the authenticator
        // seed has been generated with resetTOTP

        logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:create-local',
            result: 'success',
            email
        });
        return id;
    }

    /**
     * Delete a user from the database
     * @param id
     */
    public async deleteUser(id: string): Promise<void> {
        logger.info(`[AuthService] Deleting user id ${id}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:delete-user',
            targetUserId: id
        });

        if (await PublicUser.deleteUser(id)) {
            logger.info('[AuthService] ...success', {
                area: 'services',
                subarea: 'auth',
                action: 'auth:delete-user',
                result: 'success',
                targetUserId: id
            });
        } else {
            logger.error(`[AuthService] Failed to delete user id ${id}`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:delete-user',
                result: 'failed',
                targetUserId: id
            });
        }
    }

    /**
     * Enable or disable a user. Disabled users cannot login
     * @param id The id of the user to enable/disable
     * @param enabled Whether the user should be enabled/disabled
     */
    public async enableUser(id: string, enabled: boolean): Promise<void> {
        logger.info(`[AuthService] ${enabled ? 'Enabling ' : 'Disabling '} user id ${id}`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:enable-user',
            targetUserId: id,
            enabled
        });

        if (await PublicUser.enableUser(id, enabled)) {
            logger.error(`[AuthService] Failed to ${enabled ? 'enable ' : 'disable '} user id ${id}`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:enable-user',
                result: 'failed',
                targetUserId: id,
                enabled
            });
        } else {
            logger.info('[AuthService] ...success', {
                area: 'services',
                subarea: 'auth',
                action: 'auth:enable-user',
                result: 'success',
                targetUserId: id,
                enabled
            });
        }
    }

    /**
     * Start an invitation process by reserving the email address in the db
     * @param email The email address
     * @param roles The roles the invited user will have
     */
    public async initiateInviteLocal(email: string, roles: string[]): Promise<string> {
        logger.info(`[AuthService] Inviting ${email}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:initiate-invite-local',
            email
        });

        if (await PublicUser.emailExists(email)) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} exist in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:initiate-invite-local',
                result: 'failed',
                email
            });
            throw new UserExistError(email);
        }

        // Create user
        const id = await PublicUser.createUser(email, UserStatus.Invited, roles, CURRENT_REV);
        await PublicUser.setStatus(id, UserStatus.Invited);

        logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:initiate-invite-local',
            result: 'success',
            email
        });
        return id;
    }

    /**
     * Initiate a password reset by sending an 8 digit code to the email address requested if it exist in the database
     * @param email The email address to reset the password for
     */
    public async initiatePasswordReset(email: string): Promise<string> {
        logger.info(`[AuthService] Initiating password reset for ${email}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:initiate-password-reset',
            email
        });

        if (!await PublicUser.emailExists(email)) {
            logger.warn(`[AuthService] ...failed. Reason: User doesn't exist in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:initiate-password-reset',
                result: 'failed',
                email
            });
            throw new UserNotFoundError(email);
        }

        const { id } = await PublicUser.findByEmail(email);
        const code = this._generateResetPasswordCode();
        PublicReset.createResetEntry(id, email, code);

        logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:initiate-password-reset',
            result: 'success',
            email
        });
        return code;
    }

    /**
     * Reset OTP seed for an email
     * @param email An email address
     */
    public async resetTOTP(email: string): Promise<string> {
        logger.info(`[AuthService] Resetting TOTP for ${email}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:reset-totp',
            email
        });

        // Check if user exist...
        if (!await PublicUser.emailExists(email)) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:reset-totp',
                result: 'failed',
                email
            });
            throw new UserNotFoundError(email);
        }

        // Generate a new seed
        const seed = authenticator.generateSecret();
        const otpUrl = authenticator.keyuri(email, 'Pictaccio', seed);
        const { id } = await PublicUser.findByEmail(email);
        await PublicUser.setUserSeed(id, seed);
        await PublicUser.setStatus(id, UserStatus.Enabled);

        logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:reset-totp',
            result: 'success',
            email
        });

        return otpUrl;
    }

    public async verifyPassword(email: string, secret: string): Promise<boolean> {
        logger.info(`[AuthService] verifying password for ${email}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:verify-password',
            email
        });

        // Check if user exist...
        if (!await PublicUser.emailExists(email)) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:verify-password',
                result: 'failed',
                email
            });
            throw new UserNotFoundError(email);
        }

        // Check if password is correct...
        let result = false;
        const { id, status, hash, salt, seed, rev } = (await PublicUser.findByEmail(email));

        if (await this._hashRev1(salt + secret, salt) !== hash) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} entered an incorrect password`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:verify-secret',
                result: 'failed',
                context: 'incorrect-password',
                email
            });
            result = false;
            throw new WrongSecretError(email);
        }
        else {
            result = true;
        }

        logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:verify-password',
            result: 'success',
            email
        });

        return result;
    }

    public async changePassword(email: string, secret: string): Promise<void> {
        logger.info(`[AuthService] changing password for ${email}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:change-password',
            email
        });

        // Check if user exist...
        if (!await PublicUser.emailExists(email)) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:change-password',
                result: 'failed',
                email
            });
            throw new UserNotFoundError(email);
        }

        // Change password
        const { id, status, hash, salt, seed, rev } = (await PublicUser.findByEmail(email));
        const newHash = await this._hashRev1(salt + secret, salt);
        await PublicUser.setUserHashAndSalt(id, newHash, salt);

        logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:change-password',
            result: 'success',
            email
        });
    }

    /**
     * Identify a user behind a token
     * @param token The token
     */
    public async userFromToken(token: string): Promise<UserInterface> {
        try {
            const decoded =
                await promisify<string, Secret, VerifyOptions, TokenData>(verify)(
                    token, this._config.auth.secret, {});

            return decoded.id ? await this._userAsInterface(decoded.id) : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Validate a token
     * @param token  The token
     */
    public async validateAuthentication(token: string): Promise<boolean> {
        try {
            await promisify<string, Secret, VerifyOptions, TokenData>(verify)(token, this._config.auth.secret, {});
        } catch (e) {
            return false;
        }

        return true;
    }

    /**
     * Validate whether an authenticator token is valid
     * @param email
     * @param totpToken
     */
    public async validateAuthenticatorToken(email: string, totpToken: string): Promise<boolean> {
        const { seed } = (await PublicUser.findByEmail(email));

        return authenticator.check(totpToken, seed);
    }

    /**
     * Change a users' avatar and name
     * @param id
     * @param info
     */
    public async setUserInfo(id: string, info: UserInfo): Promise<void> {
        logger.info(`[AuthService] Changing user id ${id} info...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:set-user-info',
            data: info
        });

        await PublicUser.setUserInfo(id, info);

        logger.info(`[AuthService] ... success`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:set-user-info',
            result: 'success'
        });
    }

    /**
     * Set roles for a user
     * @param id
     * @param roles
     */
    public async setUserRoles(id: string, roles: string[]): Promise<void> {
        logger.info(`[AuthService] Changing user id ${id} roles...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:set-user-roles',
            roles
        });

        await PublicUser.setUserRoles(id, roles);

        logger.info(`[AuthService] ... success`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:set-user-info',
            result: 'success'
        });
    }

    /* PRIVATE */
    private _generateResetPasswordCode(): string {
        return parseInt(randomBytes(4).toString('hex'), 16).toString().substring(0, 8);
    }

    private async _setUserSecret(id: string, secret: string): Promise<void> {
        const salt = this._saltRev1();
        const hash = await this._hashRev1(salt + secret, salt);

        await PublicUser.setUserHashAndSalt(id, hash, salt);
    }

    /* Password revs */
    private async _hashRev1(secret: string, salt: string): Promise<string> {
        return (await promisify(pbkdf2)(secret, salt, 100000, 64, 'sha512')).toString('hex');
    }

    private _saltRev1() {
        return randomBytes(64).toString('hex');
    }

    private async _userAsInterface(id: string): Promise<UserInterface> {
        const user = await PublicUser.findOne({ where: { id } });
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
        },
            {}
        ) as unknown as UserInterface;
    }

    public async readUserSessionInfo(email: string): Promise<any> {
        logger.info(`[AuthService] reading user session info for ${email}...`, {
            area: 'services',
            subarea: 'auth',
            action: 'auth:user-session/read',
            email
        });

        // Check if user exist...
        if (!await PublicUser.emailExists(email)) {
            logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'auth',
                action: 'auth:user-session/read',
                result: 'failed',
                email
            });
            throw new UserNotFoundError(email);
        }

        // Get user session info
        const { id, status, hash, salt, seed, rev, roles_json, info_json, created, last_login } = (await PublicUser.findByEmail(email));
        const userSession = {
            email: email,
            roles: roles_json,
            created: created,
            lastLogin: last_login
        };

        logger.info('[AuthService] ...success', {
            area: 'services',
            subarea: 'auth',
            action: 'auth:user-session/read',
            result: 'success',
            email
        });

        return userSession;
    }
}
