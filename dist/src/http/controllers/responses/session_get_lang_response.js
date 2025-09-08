"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionGetLangResponse = void 0;
const tslib_1 = require("tslib");
const base_response_1 = require("../../../http/controllers/responses/base_response");
const class_validator_1 = require("class-validator");
class SessionGetLangResponse extends base_response_1.BaseResponse {
    lang;
}
exports.SessionGetLangResponse = SessionGetLangResponse;
tslib_1.__decorate([
    (0, class_validator_1.IsLocale)(),
    tslib_1.__metadata("design:type", String)
], SessionGetLangResponse.prototype, "lang", void 0);
//# sourceMappingURL=session_get_lang_response.js.map