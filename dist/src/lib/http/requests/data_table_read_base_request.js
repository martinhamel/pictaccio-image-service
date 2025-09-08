"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTableReadBaseRequest = exports.FilterOption = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class FilterOption {
    column;
    operator;
    operand;
}
exports.FilterOption = FilterOption;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], FilterOption.prototype, "column", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsIn)(['==', '!=', '>', '<', '<=', '>=', 'IN', 'NOT IN', '~', '~~']),
    tslib_1.__metadata("design:type", String)
], FilterOption.prototype, "operator", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDefined)(),
    tslib_1.__metadata("design:type", String)
], FilterOption.prototype, "operand", void 0);
class SortOption {
    column;
    order;
}
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], SortOption.prototype, "column", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsIn)(['ASC', 'DESC']),
    tslib_1.__metadata("design:type", String)
], SortOption.prototype, "order", void 0);
class DataTableReadBaseRequest {
    from;
    to;
    filters;
    sort;
    fields;
}
exports.DataTableReadBaseRequest = DataTableReadBaseRequest;
tslib_1.__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Number)
], DataTableReadBaseRequest.prototype, "from", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Number)
], DataTableReadBaseRequest.prototype, "to", void 0);
tslib_1.__decorate([
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], DataTableReadBaseRequest.prototype, "filters", void 0);
tslib_1.__decorate([
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], DataTableReadBaseRequest.prototype, "sort", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], DataTableReadBaseRequest.prototype, "fields", void 0);
//# sourceMappingURL=data_table_read_base_request.js.map