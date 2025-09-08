import { IsEmail } from 'class-validator';
import { Container } from 'typedi';
import { ConfigSchema } from '../../../core/config_schema';
import { ArrayIncludes } from '../../../lib/http/validators/array_includes';

const config = Container.get<ConfigSchema>('config');

export class InitiateInviteRequest {
    @IsEmail()
    public email: string;

    @ArrayIncludes(config.roles.list)
    public roles: string[];
}
