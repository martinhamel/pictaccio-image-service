import { IsDefined, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class DataTableValues {
    @IsDefined()
    column: string;

    @IsDefined()
    value: any;
}

export class DataTableCreateBaseRequest {
    @ValidateNested({each: true})
    values: DataTableValues[];
}

export class DataTableCreateBaseRequestRaw {
    @Transform(raw => typeof raw === 'string' ? JSON.parse(raw) : raw)
    @Type(() => DataTableCreateBaseRequest)
    @ValidateNested()
    raw: DataTableCreateBaseRequest;
}
