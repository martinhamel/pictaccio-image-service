"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetAuthenticatorResponse = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const base_response_1 = require("../../../http/controllers/responses/base_response");
class ResetAuthenticatorResponse extends base_response_1.BaseResponse {
    otpUri;
}
exports.ResetAuthenticatorResponse = ResetAuthenticatorResponse;
tslib_1.__decorate([
    (0, class_validator_1.IsUrl)(),
    tslib_1.__metadata("design:type", String)
], ResetAuthenticatorResponse.prototype, "otpUri", void 0);
//# sourceMappingURL=reset_authenticator_respponse.js.map