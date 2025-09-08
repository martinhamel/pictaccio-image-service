import { IsNotEmpty } from 'class-validator';
import { BaseResponse } from '../../../http/controllers/responses/base_response';

export class LoginResponse extends BaseResponse {
    @IsNotEmpty()
    public token?: string;
}
