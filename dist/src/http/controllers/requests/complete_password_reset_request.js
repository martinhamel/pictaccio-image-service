"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompletePasswordResetRequest = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const password_1 = require("../../../lib/http/validators/password");
class CompletePasswordResetRequest {
    email;
    resetToken;
    code;
    secret;
}
exports.CompletePasswordResetRequest = CompletePasswordResetRequest;
tslib_1.__decorate([
    (0, class_validator_1.IsEmail)(),
    tslib_1.__metadata("design:type", String)
], CompletePasswordResetRequest.prototype, "email", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsUUID)(),
    tslib_1.__metadata("design:type", String)
], CompletePasswordResetRequest.prototype, "resetToken", void 0);
tslib_1.__decorate([
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.MaxLength)(8),
    (0, class_validator_1.IsNumberString)(),
    tslib_1.__metadata("design:type", String)
], CompletePasswordResetRequest.prototype, "code", void 0);
tslib_1.__decorate([
    (0, password_1.Password)(),
    tslib_1.__metadata("design:type", String)
], CompletePasswordResetRequest.prototype, "secret", void 0);
//# sourceMappingURL=complete_password_reset_request.js.map