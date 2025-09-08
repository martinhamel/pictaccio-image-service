import { IsEmail, IsUUID } from '@loufa/class-validator';
import { Password } from '@pictaccio/image-service/src/lib/http/validators/password';

export class CompleteInviteRequest {
    @IsUUID()
    public inviteToken: string;

    @IsEmail()
    public email: string;

    @Password()
    public secret: string;
}
