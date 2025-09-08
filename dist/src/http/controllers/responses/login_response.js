"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginResponse = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const base_response_1 = require("../../../http/controllers/responses/base_response");
class LoginResponse extends base_response_1.BaseResponse {
    token;
}
exports.LoginResponse = LoginResponse;
tslib_1.__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], LoginResponse.prototype, "token", void 0);
//# sourceMappingURL=login_response.js.map