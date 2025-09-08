"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginRequest = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class LoginRequest {
    email;
    secret;
    token;
}
exports.LoginRequest = LoginRequest;
tslib_1.__decorate([
    (0, class_validator_1.IsEmail)(),
    tslib_1.__metadata("design:type", String)
], LoginRequest.prototype, "email", void 0);
tslib_1.__decorate([
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.MaxLength)(100),
    tslib_1.__metadata("design:type", String)
], LoginRequest.prototype, "secret", void 0);
tslib_1.__decorate([
    (0, class_validator_1.MinLength)(6),
    (0, class_validator_1.MaxLength)(6),
    tslib_1.__metadata("design:type", String)
], LoginRequest.prototype, "token", void 0);
//# sourceMappingURL=login_request.js.map