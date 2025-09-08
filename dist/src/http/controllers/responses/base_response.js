"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseResponse = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class BaseResponse {
    status;
    context;
    correlationId;
}
exports.BaseResponse = BaseResponse;
tslib_1.__decorate([
    (0, class_validator_1.IsIn)(['ok', 'failed', 'error']),
    tslib_1.__metadata("design:type", String)
], BaseResponse.prototype, "status", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], BaseResponse.prototype, "context", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsUUID)(),
    tslib_1.__metadata("design:type", String)
], BaseResponse.prototype, "correlationId", void 0);
//# sourceMappingURL=base_response.js.map