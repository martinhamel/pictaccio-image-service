"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditAccountRequest = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const typedi_1 = require("typedi");
const array_includes_1 = require("../../../lib/http/validators/array_includes");
const config = typedi_1.Container.get('config');
class EditAccountRequest {
    id;
    avatar;
    name;
    roles;
}
exports.EditAccountRequest = EditAccountRequest;
tslib_1.__decorate([
    (0, class_validator_1.IsUUID)(),
    tslib_1.__metadata("design:type", String)
], EditAccountRequest.prototype, "id", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDataURI)(),
    tslib_1.__metadata("design:type", String)
], EditAccountRequest.prototype, "avatar", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], EditAccountRequest.prototype, "name", void 0);
tslib_1.__decorate([
    (0, array_includes_1.ArrayIncludes)(config.roles.list),
    tslib_1.__metadata("design:type", Array)
], EditAccountRequest.prototype, "roles", void 0);
//# sourceMappingURL=edit_account_request.js.map