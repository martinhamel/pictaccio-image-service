import { BaseResponse } from '@pictaccio/image-service/src/http/controllers/responses/base_response';
import { IsLocale } from '@loufa/class-validator';

export class SessionGetLangResponse extends BaseResponse {
    @IsLocale()
    public lang: string;
}
