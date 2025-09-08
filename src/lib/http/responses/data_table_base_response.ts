import { BaseResponse } from '../../../http/controllers/responses/base_response';

export class DataTableBaseResponse extends BaseResponse {
    public affected?: number;
    public error?: string;
    public createdId?: number | string;
    public results?: any[];
    public resultTotal?: number;
}
