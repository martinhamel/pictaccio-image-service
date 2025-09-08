"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyAuthenticatorRequest = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class VerifyAuthenticatorRequest {
    email;
    token;
}
exports.VerifyAuthenticatorRequest = VerifyAuthenticatorRequest;
tslib_1.__decorate([
    (0, class_validator_1.IsEmail)(),
    tslib_1.__metadata("design:type", String)
], VerifyAuthenticatorRequest.prototype, "email", void 0);
tslib_1.__decorate([
    (0, class_validator_1.MinLength)(6),
    (0, class_validator_1.MaxLength)(6),
    tslib_1.__metadata("design:type", String)
], VerifyAuthenticatorRequest.prototype, "token", void 0);
//# sourceMappingURL=verify_authenticator_request.js.map