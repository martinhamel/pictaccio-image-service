import { IsUrl, IsUUID } from 'class-validator';
import { BaseResponse } from '../../../http/controllers/responses/base_response';

export class CompleteInviteResponse extends BaseResponse {
    @IsUUID()
    public id?: string;

    @IsUrl()
    public otpUri?: string;
}
