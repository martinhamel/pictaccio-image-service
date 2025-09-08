"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const path_1 = tslib_1.__importDefault(require("path"));
const typedi_1 = require("typedi");
const worker_threads_1 = require("worker_threads");
const bootstrap_1 = require("../../lib/bootstrap");
const logger_1 = require("../../lib/core/logger");
const typedi_2 = require("../../lib/loaders/typedi");
const config_1 = require("../../lib/loaders/config");
const typeorm_1 = require("../../lib/loaders/typeorm");
if (worker_threads_1.isMainThread) {
    console.error('[JOBSHOST] Imported on main thread');
    process.exit(1);
}
(0, bootstrap_1.bootstrap)([
    typedi_2.typediLoader,
    config_1.configLoader,
    typeorm_1.typeormLoader,
]).then(() => {
    const config = typedi_1.Container.get('config');
    const jobCache = {};
    async function runJob(name) {
        const scriptPath = path_1.default.join(config.env.dirs.jobs, name + '.js');
        let stat;
        try {
            stat = await fs_1.promises.stat(scriptPath);
        }
        catch (e) {
            stat = null;
        }
        if (stat !== null) {
            if (jobCache[name] === undefined) {
                jobCache[name] = {
                    callable: (await Promise.resolve(`${scriptPath}`).then(s => tslib_1.__importStar(require(s)))).default
                };
            }
            const job = jobCache[name];
            worker_threads_1.parentPort.emit('message', { type: 'job-started', name });
            logger_1.logger.info(`Running '${name}' on worker thread '${worker_threads_1.threadId}'`, {
                area: 'JOBSHOST',
                jobName: name,
                threadId: worker_threads_1.threadId,
            });
            const start = process.hrtime();
            job.callable();
            const diff = process.hrtime(start);
            const diffMs = Math.ceil(diff[0] * 1000 + diff[1] / 1000000);
            logger_1.logger.info(`Job '${name}' finished on worker thread '${worker_threads_1.threadId}' ` +
                `in ${diffMs}ms`, {
                area: 'JOBSHOST',
                jobName: name,
                durationInMs: diffMs,
                threadId: worker_threads_1.threadId
            });
            worker_threads_1.parentPort.emit('message', { type: 'job-stopped', name });
        }
        else {
            worker_threads_1.parentPort.emit('message', { type: 'job-invalid', name });
        }
    }
    worker_threads_1.parentPort.on('message', (msg) => {
        switch (msg.type) {
            case 'new-job':
                runJob(msg.name);
        }
    });
});
//# sourceMappingURL=jobs_host.js.map