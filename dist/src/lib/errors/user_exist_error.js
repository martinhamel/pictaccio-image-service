"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserExistError = void 0;
class UserExistError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = UserExistError.name;
    }
}
exports.UserExistError = UserExistError;
//# sourceMappingURL=user_exist_error.js.map