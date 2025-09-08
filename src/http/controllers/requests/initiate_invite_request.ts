import { IsEmail } from '@loufa/class-validator';
import { Container } from 'typedi';
import { ConfigSchema } from '@pictaccio/image-service/src/core/config_schema';
import { ArrayIncludes } from '@pictaccio/image-service/src/lib/http/validators/array_includes';

const config = Container.get<ConfigSchema>('config');

export class InitiateInviteRequest {
    @IsEmail()
    public email: string;

    @ArrayIncludes(config.roles.list)
    public roles: string[];
}
