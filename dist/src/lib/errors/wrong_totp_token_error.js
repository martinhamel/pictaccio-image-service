"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrongTOTPTokenError = void 0;
class WrongTOTPTokenError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = WrongTOTPTokenError.name;
    }
}
exports.WrongTOTPTokenError = WrongTOTPTokenError;
//# sourceMappingURL=wrong_totp_token_error.js.map