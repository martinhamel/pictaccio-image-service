"use strict";
var PublicReset_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicReset = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const moment_1 = tslib_1.__importDefault(require("moment"));
const config_1 = require("../../config");
let PublicReset = PublicReset_1 = class PublicReset extends typeorm_1.BaseEntity {
    id;
    user_id;
    email;
    code;
    created;
    static async checkResetEntry(email, code, resetToken) {
        const { id, code: dbCode, created, } = await PublicReset_1.findOne({ where: { email } });
        return {
            valid: code === dbCode &&
                (0, moment_1.default)().subtract(config_1.config.app.db.codeExpiryTimeInHour, 'hours').isBefore(created) &&
                (resetToken ? id === resetToken : true),
            resetToken: id
        };
    }
    static createResetEntry(userId, email, code) {
        const reset = new PublicReset_1();
        reset.user_id = userId;
        reset.email = email;
        reset.code = code;
        reset.save();
    }
    static async deleteExpired() {
        await PublicReset_1.delete({
            created: (0, typeorm_1.LessThan)((0, moment_1.default)().subtract(config_1.config.app.db.codeExpiryTimeInHour, 'hours').toDate())
        });
    }
    static async deleteFromResetToken(resetToken) {
        await PublicReset_1.delete(resetToken);
    }
};
exports.PublicReset = PublicReset;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], PublicReset.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    tslib_1.__metadata("design:type", String)
], PublicReset.prototype, "user_id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    tslib_1.__metadata("design:type", String)
], PublicReset.prototype, "email", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    tslib_1.__metadata("design:type", String)
], PublicReset.prototype, "code", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", Date)
], PublicReset.prototype, "created", void 0);
exports.PublicReset = PublicReset = PublicReset_1 = tslib_1.__decorate([
    (0, typeorm_1.Entity)({ name: 'reset', schema: 'public' })
], PublicReset);
//# sourceMappingURL=public_reset.js.map