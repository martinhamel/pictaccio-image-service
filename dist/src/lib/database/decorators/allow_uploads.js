"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadOptions = void 0;
exports.AllowUploads = AllowUploads;
const metadata_1 = require("../../../lib/database/decorators/metadata");
class UploadOptions {
    multiple;
    mimes;
    maxSizeInBytes;
    path;
}
exports.UploadOptions = UploadOptions;
function AllowUploads(options) {
    return function (target, propertyKey) {
        const modelMetadata = (0, metadata_1.getMetadata)(target.constructor);
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
        };
    };
}
//# sourceMappingURL=allow_uploads.js.map