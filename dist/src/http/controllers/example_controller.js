"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExampleController = void 0;
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const routing_controllers_1 = require("@loufa/routing-controllers");
const path_1 = require("path");
const typedi_1 = require("typedi");
const t_1 = require("../../lib/http/decorators/t");
const view_1 = require("../../lib/http/view/view");
let ExampleController = class ExampleController {
    _config;
    _mailer;
    test(t) {
        return {
            message: 'test',
            translated: t('cancel'),
            translatedWithNamespace: t('messages:test'),
            translatedMissingNamespace: t('missing:test'),
            translatedMissingKey: t('missing')
        };
    }
    async testSendMessage(response) {
        const message = {
            from: 'test@mail.com',
            message: 'This is a test',
            subject: 'This is a test',
            to: 'test@mail.com'
        };
        try {
            await this._mailer.send(message);
        }
        catch (error) {
            response.status(500);
            return 'Failed ' + error.message + '  ' + error.stack;
        }
        return 'Message sent';
    }
    async onlyAdmins(request) {
        return request.toString();
    }
    async renderTest(view) {
        view.setTitle('test title');
        view.addScripts('app.min.js', true, true);
        return {
            test: 'patate'
        };
    }
    async renderHome(view) {
        view.setTitle('home');
        view.addScripts('app.min.js', true, true);
    }
    async renderDocumentation(view, slug) {
        view.setTitle(slug);
        view.addScripts('app.min.js', true, true);
        const locale = 'en';
        const docs = {
            test1: 'test1.md'
        };
        return {
            mdDoc: await (await fs_1.promises.readFile((0, path_1.join)(this._config.env.dirs.docsPages, locale, docs[slug]))).toString()
        };
    }
};
exports.ExampleController = ExampleController;
tslib_1.__decorate([
    (0, typedi_1.Inject)('config'),
    tslib_1.__metadata("design:type", Object)
], ExampleController.prototype, "_config", void 0);
tslib_1.__decorate([
    (0, typedi_1.Inject)('mailer'),
    tslib_1.__metadata("design:type", Object)
], ExampleController.prototype, "_mailer", void 0);
tslib_1.__decorate([
    (0, routing_controllers_1.Get)('/test'),
    tslib_1.__param(0, t_1.T),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Function]),
    tslib_1.__metadata("design:returntype", Object)
], ExampleController.prototype, "test", null);
tslib_1.__decorate([
    (0, routing_controllers_1.Get)('/testMessage'),
    tslib_1.__param(0, (0, routing_controllers_1.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ExampleController.prototype, "testSendMessage", null);
tslib_1.__decorate([
    (0, routing_controllers_1.Authorized)('admin:read:test'),
    (0, routing_controllers_1.Get)('/only-admins'),
    tslib_1.__param(0, (0, routing_controllers_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ExampleController.prototype, "onlyAdmins", null);
tslib_1.__decorate([
    (0, routing_controllers_1.Get)('/render-test'),
    (0, routing_controllers_1.ViewRender)('test'),
    tslib_1.__param(0, (0, routing_controllers_1.ViewObj)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [view_1.View]),
    tslib_1.__metadata("design:returntype", Promise)
], ExampleController.prototype, "renderTest", null);
tslib_1.__decorate([
    (0, routing_controllers_1.Get)('/home'),
    (0, routing_controllers_1.ViewRender)('home'),
    tslib_1.__param(0, (0, routing_controllers_1.ViewObj)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [view_1.View]),
    tslib_1.__metadata("design:returntype", Promise)
], ExampleController.prototype, "renderHome", null);
tslib_1.__decorate([
    (0, routing_controllers_1.Get)('/docs/:slug'),
    (0, routing_controllers_1.ViewRender)('documentation'),
    tslib_1.__param(0, (0, routing_controllers_1.ViewObj)()),
    tslib_1.__param(1, (0, routing_controllers_1.Param)('slug')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [view_1.View, String]),
    tslib_1.__metadata("design:returntype", Promise)
], ExampleController.prototype, "renderDocumentation", null);
exports.ExampleController = ExampleController = tslib_1.__decorate([
    (0, typedi_1.Service)(),
    (0, routing_controllers_1.JsonController)()
], ExampleController);
//# sourceMappingURL=example_controller.js.map