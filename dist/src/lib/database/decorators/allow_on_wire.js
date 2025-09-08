"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllowOnWire = AllowOnWire;
const metadata_1 = require("../../../lib/database/decorators/metadata");
function AllowOnWire(target, propertyKey) {
    const modelMetadata = (0, metadata_1.getMetadata)(target.constructor);
    modelMetadata.allowedOnWire.push(propertyKey);
}
//# sourceMappingURL=allow_on_wire.js.map