"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAML2Controller = void 0;
const tslib_1 = require("tslib");
const routing_controllers_1 = require("@loufa/routing-controllers");
const typedi_1 = require("typedi");
const logger_1 = require("../../lib/core/logger");
const logger_common_1 = require("../../lib/core/logger_common");
require("../../lib/services/saml2_service");
let SAML2Controller = class SAML2Controller {
    _saml2;
    async assert(request, body, session, response) {
        try {
            const { samlResponse } = await this._saml2.assert({ request_body: body });
            if (session.auth === undefined) {
                session.auth = {};
            }
            session.auth.isAuthenticated = true;
            session.auth.samlUser = samlResponse.user;
            logger_1.logger.info(`Successfully processed idp assertion`, {
                area: 'http',
                subarea: 'controller/saml2',
                action: 'user:login',
                controller_action: 'assert',
                result: 'success',
                saml_response: samlResponse,
                ...(0, logger_common_1.httpCommonFields)(request)
            });
            if (session.auth.returnUrl) {
                response.redirect(session.auth.returnUrl);
            }
            else {
                response
                    .status(200)
                    .send(`You're logged in`)
                    .end();
            }
        }
        catch (error) {
            logger_1.logger.info(`Failed to process idp assertion`, {
                area: 'http',
                subarea: 'controller/saml2',
                action: 'user:login',
                controller_action: 'assert',
                result: 'failed',
                error,
                ...(0, logger_common_1.httpCommonFields)(request)
            });
            throw new routing_controllers_1.InternalServerError(`Failed to assert. ${error.message} ${error.stack}`);
        }
        return '';
    }
    async checkAuth(request, session, response) {
        logger_1.logger.debug(`In /check-auth, session.auth is ${session.auth === undefined ? 'undefined' : session.auth}`, {
            area: 'http',
            subarea: 'controller/saml2',
            action: 'user:login',
            controller_action: 'checkAuth',
            result: 'success',
            auth: session.auth,
            ...(0, logger_common_1.httpCommonFields)(request)
        });
        if (session.auth === undefined || session.auth && !session.auth.isAuthenticated) {
            response.status(401);
        }
        else {
            response.status(200);
        }
        response.end();
        return '';
    }
    async metadata() {
        try {
            return this._saml2.createMetadata();
        }
        catch (error) {
            throw new routing_controllers_1.InternalServerError(`Couldn't create metadata`);
        }
    }
    async login(request, session, returnUrl, cookie, response) {
        if (returnUrl) {
            if (session.auth === undefined) {
                session.auth = {};
            }
            session.auth.returnUrl = returnUrl;
        }
        try {
            const { loginUrl } = await this._saml2.login();
            logger_1.logger.info(`Successfully processed login`, {
                area: 'http',
                subarea: 'controller/saml2',
                action: 'user:login',
                controller_action: 'login',
                result: 'success',
                auth: session.auth,
                ...(0, logger_common_1.httpCommonFields)(request)
            });
            response.redirect(loginUrl);
        }
        catch (error) {
            logger_1.logger.error(`Failed to process login`, {
                area: 'http',
                subarea: 'controller/saml2',
                action: 'user:login',
                controller_action: 'login',
                result: 'failed',
                auth: session.auth,
                error,
                ...(0, logger_common_1.httpCommonFields)(request)
            });
            throw new routing_controllers_1.InternalServerError(`Couldn't login ${error.message} ${error.stack}`);
        }
    }
    async logout(request, response) {
        try {
            const { logouUrl } = await this._saml2.logout();
            logger_1.logger.info(`Successfully processed logout`, {
                area: 'http',
                subarea: 'controller/saml2',
                action: 'user:logout',
                controller_action: 'logout',
                result: 'success',
                ...(0, logger_common_1.httpCommonFields)(request)
            });
            response.redirect(logouUrl);
        }
        catch (error) {
            logger_1.logger.error(`Failed to process logout`, {
                area: 'http',
                subarea: 'controller/saml2',
                action: 'user:logout',
                controller_action: 'logout',
                result: 'failed',
                error,
                ...(0, logger_common_1.httpCommonFields)(request)
            });
            throw new routing_controllers_1.InternalServerError(`Couldn't logout ${error.message} ${error.stack}`);
        }
    }
    cookie(cookie, response) {
        response.cookie('connect.cid', cookie);
        return 'cookie :)';
    }
};
exports.SAML2Controller = SAML2Controller;
tslib_1.__decorate([
    (0, typedi_1.Inject)('saml2'),
    tslib_1.__metadata("design:type", Object)
], SAML2Controller.prototype, "_saml2", void 0);
tslib_1.__decorate([
    (0, routing_controllers_1.Post)('/assert'),
    tslib_1.__param(0, (0, routing_controllers_1.Req)()),
    tslib_1.__param(1, (0, routing_controllers_1.Body)()),
    tslib_1.__param(2, (0, routing_controllers_1.Session)()),
    tslib_1.__param(3, (0, routing_controllers_1.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SAML2Controller.prototype, "assert", null);
tslib_1.__decorate([
    (0, routing_controllers_1.Get)('/check-auth'),
    tslib_1.__param(0, (0, routing_controllers_1.Req)()),
    tslib_1.__param(1, (0, routing_controllers_1.Session)()),
    tslib_1.__param(2, (0, routing_controllers_1.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SAML2Controller.prototype, "checkAuth", null);
tslib_1.__decorate([
    (0, routing_controllers_1.Get)('/metadata.xml'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], SAML2Controller.prototype, "metadata", null);
tslib_1.__decorate([
    (0, routing_controllers_1.Get)('/login'),
    tslib_1.__param(0, (0, routing_controllers_1.Req)()),
    tslib_1.__param(1, (0, routing_controllers_1.Session)()),
    tslib_1.__param(2, (0, routing_controllers_1.QueryParam)('return_url')),
    tslib_1.__param(3, (0, routing_controllers_1.QueryParam)('cookie')),
    tslib_1.__param(4, (0, routing_controllers_1.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object, String, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SAML2Controller.prototype, "login", null);
tslib_1.__decorate([
    (0, routing_controllers_1.Get)('/logout'),
    tslib_1.__param(0, (0, routing_controllers_1.Req)()),
    tslib_1.__param(1, (0, routing_controllers_1.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SAML2Controller.prototype, "logout", null);
tslib_1.__decorate([
    (0, routing_controllers_1.Get)('/cookie'),
    tslib_1.__param(0, (0, routing_controllers_1.QueryParam)('cookie')),
    tslib_1.__param(1, (0, routing_controllers_1.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", String)
], SAML2Controller.prototype, "cookie", null);
exports.SAML2Controller = SAML2Controller = tslib_1.__decorate([
    (0, typedi_1.Service)(),
    (0, routing_controllers_1.Controller)('/saml2')
], SAML2Controller);
//# sourceMappingURL=saml2_controller.js.map