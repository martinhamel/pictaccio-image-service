"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAccountRequest = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const typedi_1 = require("typedi");
const array_includes_1 = require("../../../lib/http/validators/array_includes");
const password_1 = require("../../../lib/http/validators/password");
const config = typedi_1.Container.get('config');
class CreateAccountRequest {
    email;
    secret;
    roles;
}
exports.CreateAccountRequest = CreateAccountRequest;
tslib_1.__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEmail)(),
    tslib_1.__metadata("design:type", String)
], CreateAccountRequest.prototype, "email", void 0);
tslib_1.__decorate([
    (0, password_1.Password)(),
    tslib_1.__metadata("design:type", String)
], CreateAccountRequest.prototype, "secret", void 0);
tslib_1.__decorate([
    (0, array_includes_1.ArrayIncludes)(config.roles.list),
    tslib_1.__metadata("design:type", Array)
], CreateAccountRequest.prototype, "roles", void 0);
//# sourceMappingURL=create_account_request.js.map