"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotEnabledError = void 0;
class NotEnabledError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = NotEnabledError.name;
    }
}
exports.NotEnabledError = NotEnabledError;
//# sourceMappingURL=not_enabled_error.js.map