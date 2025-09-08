import { UserInfo, UserStatus } from '@pictaccio/image-service/src/database/models/public_user';

export interface UserInterface {
    id: string;
    status: UserStatus;
    email: string;
    roles: string[];
    info: UserInfo;
    created: Date;
    lastLogin: Date;
}
