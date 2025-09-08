import { Transform, Type } from "class-transformer";
import { ValidateNested } from '@loufa/class-validator';
import { DataTableValues } from '@pictaccio/image-service/src/lib/http/requests/data_table_create_base_request';
import { FilterOption } from '@pictaccio/image-service/src/lib/http/requests/data_table_read_base_request';

export class DataTableUpdateBaseRequest {
    @ValidateNested({ each: true })
    public filters?: FilterOption[];

    @ValidateNested({ each: true })
    values?: DataTableValues[];

    @Transform(raw => typeof raw === 'string' ? JSON.parse(raw) : raw)
    @Type(() => DataTableUpdateBaseRequest)
    @ValidateNested()
    raw?: DataTableUpdateBaseRequest;
}
