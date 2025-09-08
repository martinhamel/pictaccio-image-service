"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateResetPasswordCodeRequest = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class ValidateResetPasswordCodeRequest {
    email;
    code;
}
exports.ValidateResetPasswordCodeRequest = ValidateResetPasswordCodeRequest;
tslib_1.__decorate([
    (0, class_validator_1.IsEmail)(),
    tslib_1.__metadata("design:type", String)
], ValidateResetPasswordCodeRequest.prototype, "email", void 0);
tslib_1.__decorate([
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.MaxLength)(8),
    (0, class_validator_1.IsNumberString)(),
    tslib_1.__metadata("design:type", String)
], ValidateResetPasswordCodeRequest.prototype, "code", void 0);
//# sourceMappingURL=validate_reset_password_code_request.js.map