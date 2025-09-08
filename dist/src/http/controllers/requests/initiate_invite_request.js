"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitiateInviteRequest = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const typedi_1 = require("typedi");
const array_includes_1 = require("../../../lib/http/validators/array_includes");
const config = typedi_1.Container.get('config');
class InitiateInviteRequest {
    email;
    roles;
}
exports.InitiateInviteRequest = InitiateInviteRequest;
tslib_1.__decorate([
    (0, class_validator_1.IsEmail)(),
    tslib_1.__metadata("design:type", String)
], InitiateInviteRequest.prototype, "email", void 0);
tslib_1.__decorate([
    (0, array_includes_1.ArrayIncludes)(config.roles.list),
    tslib_1.__metadata("design:type", Array)
], InitiateInviteRequest.prototype, "roles", void 0);
//# sourceMappingURL=initiate_invite_request.js.map