"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionPostLangRequest = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class SessionPostLangRequest {
    lang;
}
exports.SessionPostLangRequest = SessionPostLangRequest;
tslib_1.__decorate([
    (0, class_validator_1.IsLocale)(),
    tslib_1.__metadata("design:type", String)
], SessionPostLangRequest.prototype, "lang", void 0);
//# sourceMappingURL=session_post_lang_request.js.map