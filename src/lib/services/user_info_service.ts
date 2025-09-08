import { join } from 'path';
import { Container, Inject, Service } from 'typedi';
import { ConfigSchema } from '../../core/config_schema';
import { PublicUser, UserInfo, UserStatus } from '../../database/models/public_user';
import { logger } from '../../lib/core/logger';
import { UserNotFoundError } from '../../lib/errors/user_not_found_error';


@Service('UserInfo')
export class UserInfoService {
    constructor(@Inject('config')
    private _config: ConfigSchema) {
    }

    // public async uploadAvatar(email: string, image: any): Promise<void> {
    //     logger.info(`[AuthService] Uploading Avatar for ${email}...`, {
    //         area: 'services',
    //         subarea: 'userInfo',
    //         action: 'userInfo:upload-avatar',
    //         email
    //     });
    //
    //     // Check if user exist...
    //     if (!await PublicUser.emailExists(email)) {
    //         logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
    //             area: 'services',
    //             subarea: 'userInfo',
    //             action: 'userInfo:upload-avatar',
    //             result: 'failed',
    //             email
    //         });
    //         throw new UserNotFoundError(email);
    //     }
    //
    //     const imageMimeType = process.platform === 'win32'
    //         ? 'image/jpeg'
    //         : await checkFileMimeType(image);
    //
    //     if (!['image/jpeg', 'image/png'].includes(imageMimeType)) {
    //         logger.error(`[AuthService] ...failed. Reason: User ${email} has sent a non supported format`, {
    //             area: 'services',
    //             subarea: 'userInfo',
    //             action: 'userInfo:upload-avatar',
    //             result: 'failed',
    //             email
    //         });
    //         throw new InvalidFormatError();
    //     }
    //
    //     const modelMetadata = getMetadata(PublicUser);
    //     logger.info(JSON.stringify(modelMetadata.allowedUploads['info_json']));
    //     const destinationDir = modelMetadata.allowedUploads['info_json'].path;
    //     const fileOnDisk = await getUniqueFilename(join(destinationDir, image.name));
    //     image.mv(fileOnDisk);
    //
    //     const config: ConfigInterface = Container.get<ConfigInterface>('config');
    //     const fileName: string = fileOnDisk.slice(config.env.dirs.public.length + 1).replace(/\\/g, '/');
    //
    //     // Set the picture
    //     const { id } = await PublicUser.findByEmail(email);
    //     await PublicUser.setUserInfo(id, { avatar: fileName });
    //     await PublicUser.setStatus(id, UserStatus.Enabled);
    //
    //     logger.info('[AuthService] ...success', {
    //         area: 'services',
    //         subarea: 'userInfo',
    //         action: 'userInfo:upload-avatar',
    //         result: 'success',
    //         email
    //     });
    // }

    // public async readAvatar(email: string): Promise<string> {
    //     logger.info(`[AuthService] Reading Avatar for ${email}...`, {
    //         area: 'services',
    //         subarea: 'userInfo',
    //         action: 'userInfo:upload-avatar',
    //         email
    //     });
    //
    //     // Check if user exist...
    //     if (!await PublicUser.emailExists(email)) {
    //         logger.warn(`[AuthService] ...failed. Reason: User ${email} not found in local db`, {
    //             area: 'services',
    //             subarea: 'userInfo',
    //             action: 'userInfo:upload-avatar',
    //             result: 'failed',
    //             email
    //         });
    //         throw new UserNotFoundError(email);
    //     }
    //
    //     // Get the picture
    //     const { id } = await PublicUser.findByEmail(email);
    //     const info = await PublicUser.getUserInfo(id);
    //     const image = info.avatar;
    //
    //     logger.info('[AuthService] ...success', {
    //         area: 'services',
    //         subarea: 'userInfo',
    //         action: 'userInfo:read-avatar',
    //         result: 'success',
    //         email
    //     });
    //
    //     return image;
    // }

    public async changeUserName(email: string, name: { firstName: string, lastName: string }): Promise<void> {
        logger.info(`[UserInfoService] Changing username for ${email}...`, {
            area: 'services',
            subarea: 'userInfo',
            action: 'userInfo:edit-username',
            email
        });

        // Check if user exist...
        if (!await PublicUser.emailExists(email)) {
            logger.warn(`[UserInfoService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'userInfo',
                action: 'userInfo:edit-username',
                result: 'failed',
                email
            });
            throw new UserNotFoundError(email);
        }

        // Set the name
        const { id } = await PublicUser.findByEmail(email);
        await PublicUser.setUserInfo(id, { name: JSON.stringify(name) });

        logger.info('[UserInfoService] ...success', {
            area: 'services',
            subarea: 'userInfo',
            action: 'userInfo:edit-username',
            result: 'success',
            email
        });
    }

    public async readUserName(email: string): Promise<string> {
        logger.info(`[UserInfoService] Reading username for ${email}...`, {
            area: 'services',
            subarea: 'userInfo',
            action: 'userInfo:read-username',
            email
        });

        // Check if user exist...
        if (!await PublicUser.emailExists(email)) {
            logger.warn(`[UserInfoService] ...failed. Reason: User ${email} not found in local db`, {
                area: 'services',
                subarea: 'userInfo',
                action: 'userInfo:read-username',
                result: 'failed',
                email
            });
            throw new UserNotFoundError(email);
        }

        // Get the name
        const { id } = await PublicUser.findByEmail(email);
        const userInfo = await PublicUser.getUserInfo(id);
        const name = (userInfo as UserInfo).name || null;

        logger.info('[UserInfoService] ...success', {
            area: 'services',
            subarea: 'userInfo',
            action: 'userInfo:read-username',
            result: 'success',
            email
        });

        return name;
    }
}
