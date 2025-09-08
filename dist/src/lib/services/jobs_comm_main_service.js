"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const typedi_1 = require("typedi");
let JobsCommMainService = class JobsCommMainService {
    fastStore;
    constructor(fastStore) {
        this.fastStore = fastStore;
    }
    init() {
    }
};
JobsCommMainService = tslib_1.__decorate([
    (0, typedi_1.Service)('jobs-comm-main'),
    tslib_1.__param(0, (0, typedi_1.Inject)('fast-store')),
    tslib_1.__metadata("design:paramtypes", [Object])
], JobsCommMainService);
exports.default = JobsCommMainService;
//# sourceMappingURL=jobs_comm_main_service.js.map