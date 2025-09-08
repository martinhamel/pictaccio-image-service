"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteAccountRequest = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class DeleteAccountRequest {
    id;
}
exports.DeleteAccountRequest = DeleteAccountRequest;
tslib_1.__decorate([
    (0, class_validator_1.IsUUID)(),
    tslib_1.__metadata("design:type", String)
], DeleteAccountRequest.prototype, "id", void 0);
//# sourceMappingURL=delete_account_request.js.map