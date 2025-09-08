"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteInviteRequest = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const password_1 = require("../../../lib/http/validators/password");
class CompleteInviteRequest {
    inviteToken;
    email;
    secret;
}
exports.CompleteInviteRequest = CompleteInviteRequest;
tslib_1.__decorate([
    (0, class_validator_1.IsUUID)(),
    tslib_1.__metadata("design:type", String)
], CompleteInviteRequest.prototype, "inviteToken", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEmail)(),
    tslib_1.__metadata("design:type", String)
], CompleteInviteRequest.prototype, "email", void 0);
tslib_1.__decorate([
    (0, password_1.Password)(),
    tslib_1.__metadata("design:type", String)
], CompleteInviteRequest.prototype, "secret", void 0);
//# sourceMappingURL=complete_invite_request.js.map