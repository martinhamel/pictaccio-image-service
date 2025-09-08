"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrongSecretError = void 0;
class WrongSecretError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = WrongSecretError.name;
    }
}
exports.WrongSecretError = WrongSecretError;
//# sourceMappingURL=wrong_secret_error.js.map