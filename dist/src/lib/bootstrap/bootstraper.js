"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bootstraper = exports.loaderState = void 0;
const worker_threads_1 = require("worker_threads");
const loader_state_1 = require("../../lib/bootstrap/loader_state");
const logger_1 = require("../../lib/core/logger");
exports.loaderState = new loader_state_1.LoaderState();
class Bootstraper {
    _loaders;
    constructor(loaders) {
        this._loaders = loaders;
    }
    run() {
        return this._runInSequence();
    }
    async _runInSequence() {
        for (const loader of this._loaders) {
            const threadString = worker_threads_1.isMainThread
                ? 'the main thread'
                : `thread ${worker_threads_1.threadId}`;
            logger_1.logger.info(`Loading module ${loader.name.replace('Loader', '')} in ${threadString}`, {
                area: 'bootstrap',
                subarea: 'bootstrap',
                action: 'loading-module',
                module: loader.name.replace('Loader', ''),
                threadId: worker_threads_1.threadId
            });
            await loader(exports.loaderState);
        }
    }
}
exports.Bootstraper = Bootstraper;
//# sourceMappingURL=bootstraper.js.map