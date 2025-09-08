"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const typedi_1 = require("typedi");
let JobsCommWorkerService = class JobsCommWorkerService {
    fastStore;
    constructor(fastStore) {
        this.fastStore = fastStore;
    }
    publishProductMissingThemeImagesReport(report) {
        this.fastStore.publish('job:product:missing-product-theme-images', JSON.stringify(report));
    }
};
JobsCommWorkerService = tslib_1.__decorate([
    (0, typedi_1.Service)('jobs-comm-worker'),
    tslib_1.__param(0, (0, typedi_1.Inject)('fast-store')),
    tslib_1.__metadata("design:paramtypes", [Object])
], JobsCommWorkerService);
exports.default = JobsCommWorkerService;
//# sourceMappingURL=jobs_comm_worker_service.js.map