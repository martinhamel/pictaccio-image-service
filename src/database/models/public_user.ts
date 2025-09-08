import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AllowOnWire } from '../../lib/database/decorators/allow_on_wire';
import { NotFoundError } from '../../lib/errors/not_found_error';

export enum UserStatus {
    Ghost = 'ghost',
    Invited = 'invited',
    Created = 'created',
    Enabled = 'enabled',
    Disabled = 'disabled'
}

export type UserInfo = {
    avatar?: string,
    name?: string,
}

@Entity({ name: 'users', schema: 'public' })
export class PublicUser extends BaseEntity {
    @AllowOnWire
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @AllowOnWire
    @Column({ type: 'text', enum: UserStatus, default: UserStatus.Ghost })
    public status: UserStatus;

    @AllowOnWire
    @Column({ type: 'text' })
    public email: string;

    @Column({ type: 'int' })
    public rev?: number;

    @Column({ type: 'text', nullable: true })
    public hash: string;

    @Column({ type: 'text', nullable: true })
    public salt: string;

    @Column({ type: 'text', nullable: true })
    public seed: string;

    @AllowOnWire
    @Column({ type: 'text', nullable: true })
    public roles_json: string;

    @AllowOnWire
    @Column({ type: 'text', nullable: true })
    public info_json: string;

    @AllowOnWire
    @CreateDateColumn({ type: 'timestamptz' })
    public created: Date;

    @AllowOnWire
    @Column({ type: 'timestamptz', nullable: true })
    public last_login: Date;

    public static async createUser(email: string, status: UserStatus, roles: string[], rev: number): Promise<string> {
        const user = new PublicUser();
        user.email = email;
        user.status = status;
        user.roles_json = JSON.stringify(roles);
        user.rev = rev;

        return (await user.save()).id;
    }

    public static async deleteUser(id: string): Promise<boolean> {
        const user = await PublicUser.findOne({ where: { id } });

        if (!user) {
            return false;
        }

        await PublicUser.delete({ id });

        return true;
    }

    public static async emailExists(email: string): Promise<boolean> {
        return await PublicUser.count({ where: { email } }) > 0;
    }

    public static async enableUser(id: string, enabled: boolean): Promise<boolean> {
        const { status } = await PublicUser.findOne({ where: { id } });

        if (!['enabled', 'disabled'].includes(status)) {
            return false;
        }

        await PublicUser.createQueryBuilder('admin.users')
            .where({ id })
            .update({ status: enabled ? UserStatus.Enabled : UserStatus.Disabled })
            .execute();
        return true;
    }

    public static async findByEmail(email: string): Promise<PublicUser> {
        return await PublicUser.findOne({ where: { email } });
    }

    public static async setLastLogin(id: string): Promise<void> {
        await PublicUser.createQueryBuilder('admin.users')
            .where({ id })
            .update({ last_login: new Date() })
            .execute();
    }

    public static async setStatus(id: string, status: UserStatus): Promise<void> {
        await PublicUser.createQueryBuilder('admin.users')
            .where({ id })
            .update({ status })
            .execute();
    }

    public static async setUserHashAndSalt(id: string, hash: string, salt: string): Promise<void> {
        await PublicUser.createQueryBuilder('admin.users')
            .where({ id })
            .update({ hash, salt })
            .execute();
    }

    public static async setUserInfo(id: string, userInfo: UserInfo): Promise<void> {
        // @ts-ignore
        let { info } = await PublicUser.findOne(id);

        if (!info) {
            info = {}
        }

        await PublicUser.createQueryBuilder('admin.users')
            .where({ id })
            .update({ info_json: JSON.stringify(Object.assign(info, userInfo)) })
            .execute();
    }

    public static async setUserRoles(id: string, roles: string[]): Promise<void> {
        if (!await PublicUser.findOne({ where: { id } })) {
            throw new NotFoundError(`User id ${id} not found`);
        }

        await PublicUser.createQueryBuilder('admin.users')
            .where({ id })
            .update({ roles_json: JSON.stringify(roles) })
            .execute();
    }

    public static async setUserSeed(id: string, seed: string): Promise<void> {
        if (!await PublicUser.findOne({ where: { id } })) {
            throw new NotFoundError(`User id ${id} not found`);
        }

        await PublicUser.createQueryBuilder('admin.users')
            .where({ id })
            .update({ seed })
            .execute();
    }

    public static async getUserInfo(id: string): Promise<any> {
        if (!await PublicUser.findOne({ where: { id } })) {
            throw new NotFoundError(`User id ${id} not found`);
        }

        const result: any = await PublicUser.findOne({ where: { id } }).then((result: PublicUser) => {
            return JSON.parse(result.info_json);
        });
        return result;
    }
}
