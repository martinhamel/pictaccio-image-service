import { IsUrl } from '@loufa/class-validator';
import { BaseResponse } from '@pictaccio/image-service/src/http/controllers/responses/base_response';

export class ResetAuthenticatorResponse extends BaseResponse {
    @IsUrl()
    public otpUri?: string;
}
