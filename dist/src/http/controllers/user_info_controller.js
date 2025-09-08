"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInfoController = void 0;
const tslib_1 = require("tslib");
const routing_controllers_1 = require("routing-controllers");
const user_info_service_1 = require("../../lib/services/user_info_service");
const typedi_1 = require("typedi");
const logger_1 = require("../../lib/core/logger");
const logger_common_1 = require("../../lib/core/logger_common");
require("../../lib/services/sendgrid_mailer_service");
let UserInfoController = class UserInfoController {
    _userInfo;
    _config;
    _mailer;
    constructor(_userInfo) {
        this._userInfo = _userInfo;
    }
    async editUserName(user, request, body) {
        try {
            await this._userInfo.changeUserName(user.email.toLowerCase(), body.content);
            return { status: 'ok' };
        }
        catch (error) {
            logger_1.logger.error(`[UserInfoController] User ${user.email} failed to change their username. Reason: ${error.message}`, {
                area: 'http',
                subarea: 'controller/userInfo',
                action: 'user:edit-username',
                controller_action: 'editUsername',
                email: user.email,
                error,
                ...(0, logger_common_1.httpCommonFields)(request)
            });
            return { status: 'failed' };
        }
    }
    async readUserName(user, request) {
        try {
            const result = await this._userInfo.readUserName(user.email.toLowerCase());
            return { status: 'ok', content: result };
        }
        catch (error) {
            logger_1.logger.error(`[UserInfoController] User ${user.email} failed to read their username. Reason: ${error.message}`, {
                area: 'http',
                subarea: 'controller/userInfo',
                action: 'user:read-username',
                controller_action: 'readUsername',
                email: user.email,
                error,
                ...(0, logger_common_1.httpCommonFields)(request)
            });
            return { status: 'failed', content: null };
        }
    }
};
exports.UserInfoController = UserInfoController;
tslib_1.__decorate([
    (0, typedi_1.Inject)('config'),
    tslib_1.__metadata("design:type", Object)
], UserInfoController.prototype, "_config", void 0);
tslib_1.__decorate([
    (0, typedi_1.Inject)('mailer'),
    tslib_1.__metadata("design:type", Object)
], UserInfoController.prototype, "_mailer", void 0);
tslib_1.__decorate([
    (0, routing_controllers_1.Authorized)(),
    (0, routing_controllers_1.Post)('/username/edit'),
    tslib_1.__param(0, (0, routing_controllers_1.CurrentUser)()),
    tslib_1.__param(1, (0, routing_controllers_1.Req)()),
    tslib_1.__param(2, (0, routing_controllers_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UserInfoController.prototype, "editUserName", null);
tslib_1.__decorate([
    (0, routing_controllers_1.Authorized)(),
    (0, routing_controllers_1.Post)('/username/read'),
    tslib_1.__param(0, (0, routing_controllers_1.CurrentUser)()),
    tslib_1.__param(1, (0, routing_controllers_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UserInfoController.prototype, "readUserName", null);
exports.UserInfoController = UserInfoController = tslib_1.__decorate([
    (0, typedi_1.Service)(),
    (0, routing_controllers_1.JsonController)('/user-info'),
    tslib_1.__param(0, (0, typedi_1.Inject)('UserInfo')),
    tslib_1.__metadata("design:paramtypes", [user_info_service_1.UserInfoService])
], UserInfoController);
//# sourceMappingURL=user_info_controller.js.map