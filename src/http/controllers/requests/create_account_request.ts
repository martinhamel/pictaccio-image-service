import { IsNotEmpty, IsEmail } from '@loufa/class-validator';
import { Container } from 'typedi';
import { ConfigSchema } from '@pictaccio/image-service/src/core/config_schema';
import { ArrayIncludes } from '@pictaccio/image-service/src/lib/http/validators/array_includes';
import { Password } from '@pictaccio/image-service/src/lib/http/validators/password';

const config = Container.get<ConfigSchema>('config');

export class CreateAccountRequest {
    @IsNotEmpty()
    @IsEmail()
    public email: string;

    @Password()
    public secret: string;

    @ArrayIncludes(config.roles.list)
    public roles: string[];
}
