import { IsDataURI, IsString, IsUUID } from 'class-validator';
import { Container } from 'typedi';
import { ConfigSchema } from '../../../core/config_schema';
import { ArrayIncludes } from '../../../lib/http/validators/array_includes';

const config = Container.get<ConfigSchema>('config');

export class EditAccountRequest {
    @IsUUID()
    public id: string;

    @IsDataURI()
    public avatar?: string;

    @IsString()
    public name?: string;

    @ArrayIncludes(config.roles.list)
    public roles?: string[];
}
