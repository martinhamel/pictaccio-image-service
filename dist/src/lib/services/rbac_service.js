"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RbacService = void 0;
const tslib_1 = require("tslib");
const accesscontrol_1 = require("accesscontrol");
const typedi_1 = require("typedi");
let RbacService = class RbacService {
    _config;
    _accessControl;
    constructor(_config) {
        this._config = _config;
        this._accessControl = new accesscontrol_1.AccessControl(_config.roles.capabilities);
    }
    can(role, operation, resource) {
        const checkRole = this._accessControl.can(role);
        const operationFunction = this._makeAccessControlMethod(operation);
        return checkRole[operationFunction]
            ? checkRole[operationFunction].call(checkRole, resource)
            : { granted: false };
        ;
    }
    _makeAccessControlMethod(operation) {
        return operation
            .replace(/:./, operation[operation.indexOf(':') + 1].toUpperCase());
    }
};
exports.RbacService = RbacService;
exports.RbacService = RbacService = tslib_1.__decorate([
    (0, typedi_1.Service)('rbac'),
    tslib_1.__param(0, (0, typedi_1.Inject)('config')),
    tslib_1.__metadata("design:paramtypes", [Object])
], RbacService);
//# sourceMappingURL=rbac_service.js.map