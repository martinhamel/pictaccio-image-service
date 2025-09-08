"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAccountResponse = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const base_response_1 = require("../../../http/controllers/responses/base_response");
class CreateAccountResponse extends base_response_1.BaseResponse {
    id;
    otpUri;
}
exports.CreateAccountResponse = CreateAccountResponse;
tslib_1.__decorate([
    (0, class_validator_1.IsUUID)(),
    tslib_1.__metadata("design:type", String)
], CreateAccountResponse.prototype, "id", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsUrl)(),
    tslib_1.__metadata("design:type", String)
], CreateAccountResponse.prototype, "otpUri", void 0);
//# sourceMappingURL=create_account_response.js.map