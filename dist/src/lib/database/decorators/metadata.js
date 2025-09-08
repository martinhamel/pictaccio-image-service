"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelMetadata = void 0;
exports.getMetadata = getMetadata;
const metadata = new WeakMap();
class Upload {
    allowedMimes = [];
    allowMultiple;
    maxSizeInBytes;
    path;
}
class ModelMetadata {
    allowedOnWire = [];
    allowedUploads = {};
}
exports.ModelMetadata = ModelMetadata;
function getMetadata(model) {
    if (!metadata.has(model)) {
        metadata.set(model, new ModelMetadata());
    }
    return metadata.get(model);
}
//# sourceMappingURL=metadata.js.map