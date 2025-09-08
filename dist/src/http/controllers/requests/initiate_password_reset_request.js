"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitiatePasswordResetRequest = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class InitiatePasswordResetRequest {
    email;
}
exports.InitiatePasswordResetRequest = InitiatePasswordResetRequest;
tslib_1.__decorate([
    (0, class_validator_1.IsEmail)(),
    tslib_1.__metadata("design:type", String)
], InitiatePasswordResetRequest.prototype, "email", void 0);
//# sourceMappingURL=initiate_password_reset_request.js.map