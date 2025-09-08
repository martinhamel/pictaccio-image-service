import { Request as ExpressRequest } from 'express';
import { PermissionInterface } from '../../lib/core/permission_interface';
import { SessionInterface } from '../../core/session_interface';
import { UserInterface } from '../../core/user_interface';

export interface Request extends ExpressRequest {
    correlationId: string;
    permissions: PermissionInterface[];
    session: SessionInterface;
    user: UserInterface;
}
