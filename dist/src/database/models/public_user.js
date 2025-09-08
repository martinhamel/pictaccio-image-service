"use strict";
var PublicUser_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicUser = exports.UserStatus = void 0;
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const allow_on_wire_1 = require("../../lib/database/decorators/allow_on_wire");
const not_found_error_1 = require("../../lib/errors/not_found_error");
var UserStatus;
(function (UserStatus) {
    UserStatus["Ghost"] = "ghost";
    UserStatus["Invited"] = "invited";
    UserStatus["Created"] = "created";
    UserStatus["Enabled"] = "enabled";
    UserStatus["Disabled"] = "disabled";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
let PublicUser = PublicUser_1 = class PublicUser extends typeorm_1.BaseEntity {
    id;
    status;
    email;
    rev;
    hash;
    salt;
    seed;
    roles_json;
    info_json;
    created;
    last_login;
    static async createUser(email, status, roles, rev) {
        const user = new PublicUser_1();
        user.email = email;
        user.status = status;
        user.roles_json = JSON.stringify(roles);
        user.rev = rev;
        return (await user.save()).id;
    }
    static async deleteUser(id) {
        const user = await PublicUser_1.findOne({ where: { id } });
        if (!user) {
            return false;
        }
        await PublicUser_1.delete({ id });
        return true;
    }
    static async emailExists(email) {
        return await PublicUser_1.count({ where: { email } }) > 0;
    }
    static async enableUser(id, enabled) {
        const { status } = await PublicUser_1.findOne({ where: { id } });
        if (!['enabled', 'disabled'].includes(status)) {
            return false;
        }
        await PublicUser_1.createQueryBuilder('admin.users')
            .where({ id })
            .update({ status: enabled ? UserStatus.Enabled : UserStatus.Disabled })
            .execute();
        return true;
    }
    static async findByEmail(email) {
        return await PublicUser_1.findOne({ where: { email } });
    }
    static async setLastLogin(id) {
        await PublicUser_1.createQueryBuilder('admin.users')
            .where({ id })
            .update({ last_login: new Date() })
            .execute();
    }
    static async setStatus(id, status) {
        await PublicUser_1.createQueryBuilder('admin.users')
            .where({ id })
            .update({ status })
            .execute();
    }
    static async setUserHashAndSalt(id, hash, salt) {
        await PublicUser_1.createQueryBuilder('admin.users')
            .where({ id })
            .update({ hash, salt })
            .execute();
    }
    static async setUserInfo(id, userInfo) {
        let { info } = await PublicUser_1.findOne(id);
        if (!info) {
            info = {};
        }
        await PublicUser_1.createQueryBuilder('admin.users')
            .where({ id })
            .update({ info_json: JSON.stringify(Object.assign(info, userInfo)) })
            .execute();
    }
    static async setUserRoles(id, roles) {
        if (!await PublicUser_1.findOne({ where: { id } })) {
            throw new not_found_error_1.NotFoundError(`User id ${id} not found`);
        }
        await PublicUser_1.createQueryBuilder('admin.users')
            .where({ id })
            .update({ roles_json: JSON.stringify(roles) })
            .execute();
    }
    static async setUserSeed(id, seed) {
        if (!await PublicUser_1.findOne({ where: { id } })) {
            throw new not_found_error_1.NotFoundError(`User id ${id} not found`);
        }
        await PublicUser_1.createQueryBuilder('admin.users')
            .where({ id })
            .update({ seed })
            .execute();
    }
    static async getUserInfo(id) {
        if (!await PublicUser_1.findOne({ where: { id } })) {
            throw new not_found_error_1.NotFoundError(`User id ${id} not found`);
        }
        const result = await PublicUser_1.findOne({ where: { id } }).then((result) => {
            return JSON.parse(result.info_json);
        });
        return result;
    }
};
exports.PublicUser = PublicUser;
tslib_1.__decorate([
    allow_on_wire_1.AllowOnWire,
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], PublicUser.prototype, "id", void 0);
tslib_1.__decorate([
    allow_on_wire_1.AllowOnWire,
    (0, typeorm_1.Column)({ type: 'text', enum: UserStatus, default: UserStatus.Ghost }),
    tslib_1.__metadata("design:type", String)
], PublicUser.prototype, "status", void 0);
tslib_1.__decorate([
    allow_on_wire_1.AllowOnWire,
    (0, typeorm_1.Column)({ type: 'text' }),
    tslib_1.__metadata("design:type", String)
], PublicUser.prototype, "email", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    tslib_1.__metadata("design:type", Number)
], PublicUser.prototype, "rev", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    tslib_1.__metadata("design:type", String)
], PublicUser.prototype, "hash", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    tslib_1.__metadata("design:type", String)
], PublicUser.prototype, "salt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    tslib_1.__metadata("design:type", String)
], PublicUser.prototype, "seed", void 0);
tslib_1.__decorate([
    allow_on_wire_1.AllowOnWire,
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    tslib_1.__metadata("design:type", String)
], PublicUser.prototype, "roles_json", void 0);
tslib_1.__decorate([
    allow_on_wire_1.AllowOnWire,
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    tslib_1.__metadata("design:type", String)
], PublicUser.prototype, "info_json", void 0);
tslib_1.__decorate([
    allow_on_wire_1.AllowOnWire,
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    tslib_1.__metadata("design:type", Date)
], PublicUser.prototype, "created", void 0);
tslib_1.__decorate([
    allow_on_wire_1.AllowOnWire,
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    tslib_1.__metadata("design:type", Date)
], PublicUser.prototype, "last_login", void 0);
exports.PublicUser = PublicUser = PublicUser_1 = tslib_1.__decorate([
    (0, typeorm_1.Entity)({ name: 'users', schema: 'public' })
], PublicUser);
//# sourceMappingURL=public_user.js.map