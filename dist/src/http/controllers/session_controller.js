"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionController = void 0;
const tslib_1 = require("tslib");
const i18next_1 = require("i18next");
const typedi_1 = require("typedi");
const routing_controllers_1 = require("routing-controllers");
const routing_controllers_openapi_1 = require("routing-controllers-openapi");
const session_get_lang_response_1 = require("../../http/controllers/responses/session_get_lang_response");
const session_post_lang_response_1 = require("../../http/controllers/responses/session_post_lang_response");
const session_post_lang_request_1 = require("../../http/controllers/requests/session_post_lang_request");
let SessionController = class SessionController {
    _config;
    constructor(_config) {
        this._config = _config;
    }
    async getLang(session) {
        return {
            status: 'ok',
            lang: session.lang || this._config.locales.fallbacks.lang
        };
    }
    async postLang(body, session, response) {
        if (!this._config.locales.supported.includes(body.lang)) {
            response.status(400);
            return {
                status: 'failed'
            };
        }
        await (0, i18next_1.changeLanguage)(body.lang);
        session.lang = body.lang;
        return {
            status: 'ok'
        };
    }
};
exports.SessionController = SessionController;
tslib_1.__decorate([
    (0, routing_controllers_1.Get)('/lang'),
    (0, routing_controllers_openapi_1.ResponseSchema)(session_get_lang_response_1.SessionGetLangResponse),
    tslib_1.__param(0, (0, routing_controllers_1.Session)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SessionController.prototype, "getLang", null);
tslib_1.__decorate([
    (0, routing_controllers_1.Post)('/lang'),
    (0, routing_controllers_openapi_1.ResponseSchema)(session_post_lang_response_1.SessionPostLangResponse),
    tslib_1.__param(0, (0, routing_controllers_1.Body)()),
    tslib_1.__param(1, (0, routing_controllers_1.Session)()),
    tslib_1.__param(2, (0, routing_controllers_1.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [session_post_lang_request_1.SessionPostLangRequest, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SessionController.prototype, "postLang", null);
exports.SessionController = SessionController = tslib_1.__decorate([
    (0, typedi_1.Service)(),
    (0, routing_controllers_1.JsonController)('/session'),
    tslib_1.__param(0, (0, typedi_1.Inject)('config')),
    tslib_1.__metadata("design:paramtypes", [Object])
], SessionController);
//# sourceMappingURL=session_controller.js.map