"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidAuthenticationError = void 0;
class InvalidAuthenticationError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = InvalidAuthenticationError.name;
    }
}
exports.InvalidAuthenticationError = InvalidAuthenticationError;
//# sourceMappingURL=invalid_authentication_error.js.map