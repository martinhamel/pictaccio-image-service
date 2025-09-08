import { IsEmail, IsUUID } from 'class-validator';
import { Password } from '../../../lib/http/validators/password';

export class CompleteInviteRequest {
    @IsUUID()
    public inviteToken: string;

    @IsEmail()
    public email: string;

    @Password()
    public secret: string;
}
