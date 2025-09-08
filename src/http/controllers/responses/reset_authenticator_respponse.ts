import { IsUrl } from 'class-validator';
import { BaseResponse } from '../../../http/controllers/responses/base_response';

export class ResetAuthenticatorResponse extends BaseResponse {
    @IsUrl()
    public otpUri?: string;
}
