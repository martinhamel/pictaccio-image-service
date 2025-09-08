import { IsEmail, IsUrl, IsUUID } from '@loufa/class-validator';
import { BaseResponse } from '@pictaccio/image-service/src/http/controllers/responses/base_response';

export class ValidateResetPasswordCodeResponse extends BaseResponse {
    @IsUUID()
    public resetToken?: string;
}
