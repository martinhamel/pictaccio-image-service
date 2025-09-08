"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidFormatError = void 0;
class InvalidFormatError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = InvalidFormatError.name;
    }
}
exports.InvalidFormatError = InvalidFormatError;
//# sourceMappingURL=invalid_format.js.map