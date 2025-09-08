"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onExit = exports.LoaderState = exports.exportState = exports.loaderState = void 0;
exports.bootstrap = bootstrap;
const bootstraper_1 = require("../../lib/bootstrap/bootstraper");
var bootstraper_2 = require("../../lib/bootstrap/bootstraper");
Object.defineProperty(exports, "loaderState", { enumerable: true, get: function () { return bootstraper_2.loaderState; } });
var export_state_decorator_1 = require("../../lib/bootstrap/export_state_decorator");
Object.defineProperty(exports, "exportState", { enumerable: true, get: function () { return export_state_decorator_1.exportState; } });
var loader_state_1 = require("../../lib/bootstrap/loader_state");
Object.defineProperty(exports, "LoaderState", { enumerable: true, get: function () { return loader_state_1.LoaderState; } });
var on_exit_1 = require("../../lib/bootstrap/on_exit");
Object.defineProperty(exports, "onExit", { enumerable: true, get: function () { return on_exit_1.onExit; } });
function bootstrap(loaders) {
    const bootstrapper = new bootstraper_1.Bootstraper(loaders);
    return bootstrapper.run();
}
//# sourceMappingURL=index.js.map