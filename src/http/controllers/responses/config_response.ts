import { ClientConfigInterface } from '../../../core/common/client_config_interface';
import { BaseResponse } from '../../../http/controllers/responses/base_response';

export interface ConfigResponse extends BaseResponse {
    config: ClientConfigInterface;
}
