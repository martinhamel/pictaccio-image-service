"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetAuthenticatorRequest = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class ResetAuthenticatorRequest {
    email;
}
exports.ResetAuthenticatorRequest = ResetAuthenticatorRequest;
tslib_1.__decorate([
    (0, class_validator_1.IsEmail)(),
    tslib_1.__metadata("design:type", String)
], ResetAuthenticatorRequest.prototype, "email", void 0);
//# sourceMappingURL=reset_authenticator_request.js.map