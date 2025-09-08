"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidResetCodeError = void 0;
class InvalidResetCodeError extends Error {
    email;
    constructor(email) {
        super(`Invalid reset code submitted. ${email}`);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = InvalidResetCodeError.name;
        this.email = email;
    }
}
exports.InvalidResetCodeError = InvalidResetCodeError;
//# sourceMappingURL=invalid_reset_code_error.js.map