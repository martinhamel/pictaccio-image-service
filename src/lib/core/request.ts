import { Request as ExpressRequest } from 'express';
import { PermissionInterface } from '@pictaccio/image-service/src/lib/core/permission_interface';
import { SessionInterface } from '@pictaccio/image-service/src/core/session_interface';
import { UserInterface } from '@pictaccio/image-service/src/core/user_interface';

export interface Request extends ExpressRequest {
    correlationId: string;
    permissions: PermissionInterface[];
    session: SessionInterface;
    user: UserInterface;
}
