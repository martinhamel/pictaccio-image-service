"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedulerLoader = void 0;
const tslib_1 = require("tslib");
const node_cron_1 = tslib_1.__importDefault(require("node-cron"));
const path_1 = tslib_1.__importDefault(require("path"));
const worker_threads_1 = require("worker_threads");
const typedi_1 = require("typedi");
const logger_1 = require("../../lib/core/logger");
class WorkerTheadArray extends Array {
    static from(workers) {
        const array = new WorkerTheadArray();
        for (const [index, worker] of workers.entries()) {
            array[index] = worker;
        }
        return array;
    }
    postToLessBusyWorker(name) {
        logger_1.logger.debug(`Posting job '${name}'`, {
            area: 'loaders',
            subarea: 'scheduler',
            action: 'jobs:scheduling',
            jobName: name
        });
        this.sort((a, b) => a.jobCount - b.jobCount)[0].thread.postMessage({ type: 'new-job', name });
    }
}
function createWorkerThreads(srcPath, concurrency) {
    const workers = [];
    logger_1.logger.debug(`Creating ${concurrency} worker thread(s)`, {
        area: 'loaders',
        subarea: 'scheduler',
        action: 'jobs:create-worker-thread',
        concurrency
    });
    for (let i = 0; i < concurrency; i++) {
        const worker = new worker_threads_1.Worker(path_1.default.join(srcPath, 'lib/core/jobs_host.js'));
        worker.on('message', (msg) => {
            const workerId = i;
            switch (msg.type) {
                case 'job-started':
                    workers[workerId].jobCount++;
                    break;
                case 'job-stopped':
                case 'job-invalid':
                    workers[workerId].jobCount--;
                    break;
            }
        });
        workers.push({
            jobCount: 0,
            thread: worker
        });
    }
    return WorkerTheadArray.from(workers);
}
const schedulerLoader = async () => {
    const config = typedi_1.Container.get('config');
    const workers = createWorkerThreads(config.env.dirs.root, config.scheduler.concurrency);
    logger_1.logger.debug('Reading background jobs config', {
        area: 'loaders',
        subarea: 'scheduler',
        action: 'jobs:reading-config'
    });
    for (const job of config.scheduler.jobs.filter(job => job.disabled !== true)) {
        node_cron_1.default.schedule(job.timing, () => { workers.postToLessBusyWorker(job.name); });
    }
};
exports.schedulerLoader = schedulerLoader;
//# sourceMappingURL=scheduler.js.map