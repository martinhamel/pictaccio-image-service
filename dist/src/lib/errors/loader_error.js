"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoaderError = void 0;
class LoaderError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = LoaderError.name;
    }
}
exports.LoaderError = LoaderError;
//# sourceMappingURL=loader_error.js.map