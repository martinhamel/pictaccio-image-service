import { UploadAvatarRequest } from '../../http/controllers/requests/upload_avatar_request';
import { Authorized, Body, CurrentUser, JsonController, Post, Req } from 'routing-controllers';
import { UserInfoService } from '../../lib/services/user_info_service';
import { Inject, Service } from 'typedi';
import { ConfigSchema } from '../../core/config_schema';
import { logger } from '../../lib/core/logger';
import { httpCommonFields } from '../../lib/core/logger_common';
import { Request } from '../../lib/core/request';
import "../../lib/services/sendgrid_mailer_service";
import { MailerInterface } from '../../core/mailer_interface';
import { UserInterface } from '../../core/user_interface';


@Service()
@JsonController('/user-info')
export class UserInfoController {
    @Inject('config')
    private _config: ConfigSchema;

    @Inject('mailer')
    private _mailer: MailerInterface;

    constructor(@Inject('UserInfo') private _userInfo: UserInfoService) {
    }

    // @Authorized()
    // @Post('/avatar/edit')
    // public async uploadAvatar(@CurrentUser() user: UserInterface,
    //                           @Req() request: Request,
    //                           @Body() body: UploadAvatarRequest): Promise<{ status: string }> {
    //     try {
    //         await this._userInfo.uploadAvatar(user.email.toLowerCase(), request.files['content']);
    //         return { status: 'ok' };
    //     } catch (error) {
    //         logger.error(`[AuthController] User ${user.email} failed to upload their avatar. Reason: ${error.message}`, {
    //             area: 'http',
    //             subarea: 'controller/userInfo',
    //             action: 'user:upload-avatar',
    //             controller_action: 'uploadAvatar',
    //             email: user.email,
    //             error,
    //             ...httpCommonFields(request)
    //         });
    //         return { status: 'failed' };
    //     }
    // }

    // @Authorized()
    // @Post('/avatar/read')
    // public async readAvatar(@CurrentUser() user: UserInterface,
    //                           @Req() request: Request,
    //                           @Body() body: UploadAvatarRequest): Promise<{ status: string, content: string }> {
    //     try {
    //         const result = await this._userInfo.readAvatar(user.email.toLowerCase());
    //         return { status: 'ok', content: result };
    //     } catch (error) {
    //         logger.error(`[AuthController] User ${user.email} failed to fetch their avatar. Reason: ${error.message}`, {
    //             area: 'http',
    //             subarea: 'controller/userInfo',
    //             action: 'user:read-avatar',
    //             controller_action: 'readAvatar',
    //             email: user.email,
    //             error,
    //             ...httpCommonFields(request)
    //         });
    //         return { status: 'failed', content: null };
    //     }
    // }

    @Authorized()
    @Post('/username/edit')
    public async editUserName(@CurrentUser() user: UserInterface,
        @Req() request: Request,
        @Body() body: { content: { firstName: string, lastName: string } }): Promise<{ status: string }> {
        try {
            await this._userInfo.changeUserName(user.email.toLowerCase(), body.content);
            return { status: 'ok' };
        } catch (error) {
            logger.error(`[UserInfoController] User ${user.email} failed to change their username. Reason: ${error.message}`, {
                area: 'http',
                subarea: 'controller/userInfo',
                action: 'user:edit-username',
                controller_action: 'editUsername',
                email: user.email,
                error,
                ...httpCommonFields(request)
            });
            return { status: 'failed' };
        }
    }

    @Authorized()
    @Post('/username/read')
    public async readUserName(@CurrentUser() user: UserInterface,
        @Req() request: Request): Promise<{ status: string, content: string }> {
        try {
            const result = await this._userInfo.readUserName(user.email.toLowerCase());
            return { status: 'ok', content: result };
        } catch (error) {
            logger.error(`[UserInfoController] User ${user.email} failed to read their username. Reason: ${error.message}`, {
                area: 'http',
                subarea: 'controller/userInfo',
                action: 'user:read-username',
                controller_action: 'readUsername',
                email: user.email,
                error,
                ...httpCommonFields(request)
            });
            return { status: 'failed', content: null };
        }
    }
}
