import { ClientConfigInterface } from '@pictaccio/image-service/src/core/common/client_config_interface';
import { BaseResponse } from '@pictaccio/image-service/src/http/controllers/responses/base_response';

export interface ConfigResponse extends BaseResponse {
    config: ClientConfigInterface;
}
