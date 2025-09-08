"use strict";
var PublicInvite_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicInvite = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const moment_1 = tslib_1.__importDefault(require("moment"));
const typedi_1 = require("typedi");
const config = typedi_1.Container.get('config');
let PublicInvite = PublicInvite_1 = class PublicInvite extends typeorm_1.BaseEntity {
    id;
    user_id;
    email;
    created;
    static async createInvite(id, email) {
        const invite = new PublicInvite_1();
        invite.user_id = id.toString();
        invite.email = email;
        return (await invite.save()).id;
    }
    static async deleteExpired() {
        await PublicInvite_1.delete({
            created: (0, typeorm_1.LessThan)((0, moment_1.default)().subtract(config.app.db.codeExpiryTimeInHour, 'hours').toDate())
        });
    }
    static async findByToken(token) {
        return PublicInvite_1.findOne({ where: { id: token } });
    }
};
exports.PublicInvite = PublicInvite;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], PublicInvite.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    tslib_1.__metadata("design:type", String)
], PublicInvite.prototype, "user_id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    tslib_1.__metadata("design:type", String)
], PublicInvite.prototype, "email", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", Date)
], PublicInvite.prototype, "created", void 0);
exports.PublicInvite = PublicInvite = PublicInvite_1 = tslib_1.__decorate([
    (0, typeorm_1.Entity)({ name: 'invite', schema: 'public' })
], PublicInvite);
//# sourceMappingURL=public_invite.js.map