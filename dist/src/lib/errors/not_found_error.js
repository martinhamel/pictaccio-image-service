"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = void 0;
class NotFoundError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = NotFoundError.name;
    }
}
exports.NotFoundError = NotFoundError;
//# sourceMappingURL=not_found_error.js.map