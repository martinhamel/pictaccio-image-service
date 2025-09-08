"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeoutError = void 0;
class TimeoutError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = TimeoutError.name;
    }
}
exports.TimeoutError = TimeoutError;
//# sourceMappingURL=timeout_error.js.map