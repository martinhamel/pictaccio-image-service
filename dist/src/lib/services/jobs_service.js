"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const node_path_1 = require("node:path");
const node_child_process_1 = require("node:child_process");
const typedi_1 = require("typedi");
const config_1 = require("../../config");
let count = 0;
let JobsService = class JobsService {
    run(jobName, message) {
        return new Promise((resolve) => {
            const processJob = () => {
                const child = (0, node_child_process_1.fork)((0, node_path_1.join)(config_1.config.env.dirs.root, `jobs/${jobName}.ts`), {
                    stdio: 'inherit'
                });
                count++;
                console.log('Creating worker, total count: ' + count);
                child.on('message', () => {
                    child.kill();
                    resolve();
                });
                child.on('exit', (code) => {
                    count--;
                    console.log('Exiting worker, total count: ' + count);
                    if (code) {
                        console.log('Worker exited with code ' + code);
                        setTimeout(() => {
                            processJob();
                        }, 600000);
                    }
                });
                setTimeout(() => {
                    child.kill();
                    setTimeout(() => {
                        processJob();
                    }, 600000);
                }, 180000);
                child.send(message);
            };
            processJob();
        });
    }
};
JobsService = tslib_1.__decorate([
    (0, typedi_1.Service)()
], JobsService);
exports.default = JobsService;
//# sourceMappingURL=jobs_service.js.map