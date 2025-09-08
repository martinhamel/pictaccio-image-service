import { BaseEntity } from 'typeorm';
import { getMetadata } from '../../../lib/database/decorators/metadata';

export function AllowOnWire(target: any, propertyKey: string): void {
    const modelMetadata = getMetadata(target.constructor);
    modelMetadata.allowedOnWire.push(propertyKey as keyof BaseEntity);
}
