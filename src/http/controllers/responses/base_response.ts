import { IsNotEmpty, IsIn, IsUUID } from 'class-validator';

export class BaseResponse {
    @IsIn(['ok', 'failed', 'error'])
    public status: string;

    @IsNotEmpty()
    public context?: string;

    @IsUUID()
    public correlationId?: string;
}
