"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTableUpdateBaseRequest = void 0;
const tslib_1 = require("tslib");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class DataTableUpdateBaseRequest {
    filters;
    values;
    raw;
}
exports.DataTableUpdateBaseRequest = DataTableUpdateBaseRequest;
tslib_1.__decorate([
    (0, class_validator_1.ValidateNested)({ each: true }),
    tslib_1.__metadata("design:type", Array)
], DataTableUpdateBaseRequest.prototype, "filters", void 0);
tslib_1.__decorate([
    (0, class_validator_1.ValidateNested)({ each: true }),
    tslib_1.__metadata("design:type", Array)
], DataTableUpdateBaseRequest.prototype, "values", void 0);
tslib_1.__decorate([
    (0, class_transformer_1.Transform)(raw => typeof raw === 'string' ? JSON.parse(raw) : raw),
    (0, class_transformer_1.Type)(() => DataTableUpdateBaseRequest),
    (0, class_validator_1.ValidateNested)(),
    tslib_1.__metadata("design:type", DataTableUpdateBaseRequest)
], DataTableUpdateBaseRequest.prototype, "raw", void 0);
//# sourceMappingURL=data_table_update_base_request.js.map