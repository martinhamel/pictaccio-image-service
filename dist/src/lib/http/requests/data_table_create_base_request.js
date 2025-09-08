"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTableCreateBaseRequestRaw = exports.DataTableCreateBaseRequest = exports.DataTableValues = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class DataTableValues {
    column;
    value;
}
exports.DataTableValues = DataTableValues;
tslib_1.__decorate([
    (0, class_validator_1.IsDefined)(),
    tslib_1.__metadata("design:type", String)
], DataTableValues.prototype, "column", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDefined)(),
    tslib_1.__metadata("design:type", Object)
], DataTableValues.prototype, "value", void 0);
class DataTableCreateBaseRequest {
    values;
}
exports.DataTableCreateBaseRequest = DataTableCreateBaseRequest;
tslib_1.__decorate([
    (0, class_validator_1.ValidateNested)({ each: true }),
    tslib_1.__metadata("design:type", Array)
], DataTableCreateBaseRequest.prototype, "values", void 0);
class DataTableCreateBaseRequestRaw {
    raw;
}
exports.DataTableCreateBaseRequestRaw = DataTableCreateBaseRequestRaw;
tslib_1.__decorate([
    (0, class_transformer_1.Transform)(raw => typeof raw === 'string' ? JSON.parse(raw) : raw),
    (0, class_transformer_1.Type)(() => DataTableCreateBaseRequest),
    (0, class_validator_1.ValidateNested)(),
    tslib_1.__metadata("design:type", DataTableCreateBaseRequest)
], DataTableCreateBaseRequestRaw.prototype, "raw", void 0);
//# sourceMappingURL=data_table_create_base_request.js.map