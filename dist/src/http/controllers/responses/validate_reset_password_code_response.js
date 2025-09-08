"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateResetPasswordCodeResponse = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const base_response_1 = require("../../../http/controllers/responses/base_response");
class ValidateResetPasswordCodeResponse extends base_response_1.BaseResponse {
    resetToken;
}
exports.ValidateResetPasswordCodeResponse = ValidateResetPasswordCodeResponse;
tslib_1.__decorate([
    (0, class_validator_1.IsUUID)(),
    tslib_1.__metadata("design:type", String)
], ValidateResetPasswordCodeResponse.prototype, "resetToken", void 0);
//# sourceMappingURL=validate_reset_password_code_response.js.map