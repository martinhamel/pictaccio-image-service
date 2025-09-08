"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onExit = onExit;
function onExit(callable) {
    process.on('exit', exitCode => callable('exit', exitCode));
    process.on('SIGINT', signal => callable('SIGINT', signal));
    process.on('SIGUSR1', signal => callable('SIGUSR1', signal));
    process.on('SIGUSR2', signal => callable('SIGUSR2', signal));
    process.on('uncaughtException', error => callable('uncaught-exception', 0, error));
}
//# sourceMappingURL=on_exit.js.map