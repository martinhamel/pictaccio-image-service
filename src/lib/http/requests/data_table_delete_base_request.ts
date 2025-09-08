import { IsOptional, ValidateNested } from '@loufa/class-validator';
import { FilterOption } from '@pictaccio/image-service/src/lib/http/requests/data_table_read_base_request';

export class DataTableDeleteBaseRequest {
    @ValidateNested({ each: true })
    @IsOptional()
    public filters?: FilterOption[];
}
