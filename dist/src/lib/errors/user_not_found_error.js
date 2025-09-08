"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserNotFoundError = void 0;
class UserNotFoundError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = UserNotFoundError.name;
    }
}
exports.UserNotFoundError = UserNotFoundError;
//# sourceMappingURL=user_not_found_error.js.map