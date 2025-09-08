"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileNotAllowedError = void 0;
class FileNotAllowedError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = FileNotAllowedError.name;
    }
}
exports.FileNotAllowedError = FileNotAllowedError;
//# sourceMappingURL=file_not_allowed_error.js.map