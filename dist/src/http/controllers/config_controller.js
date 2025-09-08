"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigController = void 0;
const tslib_1 = require("tslib");
const routing_controllers_1 = require("@loufa/routing-controllers");
const routing_controllers_2 = require("routing-controllers");
const typedi_1 = require("typedi");
let ConfigController = class ConfigController {
    _config;
    constructor(_config) {
        this._config = _config;
    }
    config() {
        return {
            status: 'ok',
            config: {
                app: {
                    locale: this._config.app.locale,
                    password: this._config.app.password
                }
            }
        };
    }
    version(response) {
        return response.status(200).send(this._config.env.version);
    }
};
exports.ConfigController = ConfigController;
tslib_1.__decorate([
    (0, routing_controllers_1.Get)('/data/config.json'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Object)
], ConfigController.prototype, "config", null);
tslib_1.__decorate([
    (0, routing_controllers_2.Authorized)(),
    (0, routing_controllers_1.Get)('/data/version'),
    tslib_1.__param(0, (0, routing_controllers_2.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], ConfigController.prototype, "version", null);
exports.ConfigController = ConfigController = tslib_1.__decorate([
    (0, typedi_1.Service)(),
    (0, routing_controllers_1.JsonController)(),
    tslib_1.__param(0, (0, typedi_1.Inject)('config')),
    tslib_1.__metadata("design:paramtypes", [Object])
], ConfigController);
//# sourceMappingURL=config_controller.js.map