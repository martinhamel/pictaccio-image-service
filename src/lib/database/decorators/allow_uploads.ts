import { getMetadata } from '../../../lib/database/decorators/metadata';

export class UploadOptions {
    public multiple?: boolean;
    public mimes?: string | string[];
    public maxSizeInBytes?: number;
    public path: string;
}

export function AllowUploads(options: UploadOptions): (target: any, propertyKey: string) => void {
    return function (target: any, propertyKey: string): void {
        const modelMetadata = getMetadata(target.constructor);

        if (modelMetadata.allowedUploads[propertyKey] !== undefined) {
            throw new Error('Something\'s wrong here');
        }

        modelMetadata.allowedUploads[propertyKey] = {
            allowedMimes: Array.isArray(options.mimes)
                ? options.mimes.map(mime => new RegExp(mime.replace('*', '.*')))
                : options.mimes
                    ? [new RegExp(options.mimes.replace('*', '.*'))]
                    : [/.*/],
            allowMultiple: options.multiple || false,
            maxSizeInBytes: options.maxSizeInBytes || 0,
            path: options.path
        }
    }
}
