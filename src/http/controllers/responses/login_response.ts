import { IsNotEmpty } from '@loufa/class-validator';
import { BaseResponse } from '@pictaccio/image-service/src/http/controllers/responses/base_response';

export class LoginResponse extends BaseResponse {
    @IsNotEmpty()
    public token?: string;
}
