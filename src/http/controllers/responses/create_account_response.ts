import { IsUrl, IsUUID } from '@loufa/class-validator';
import { BaseResponse } from '@pictaccio/image-service/src/http/controllers/responses/base_response';

export class CreateAccountResponse extends BaseResponse {
    @IsUUID()
    public id?: string;

    @IsUrl()
    public otpUri?: string;
}
