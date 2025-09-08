import { BaseEntity, Column, CreateDateColumn, Entity, LessThan, PrimaryGeneratedColumn } from 'typeorm';
import moment from 'moment';
import { Container } from 'typedi';
import { ConfigSchema } from '../../core/config_schema';

const config = Container.get<ConfigSchema>('config');

@Entity({ name: 'invite', schema: 'public' })
export class PublicInvite extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column({ type: 'text' })
    public user_id: string;

    @Column({ type: 'text' })
    public email: string;

    @CreateDateColumn()
    public created: Date;

    public static async createInvite(id: string, email: string): Promise<string> {
        const invite = new PublicInvite();

        invite.user_id = id.toString();
        invite.email = email;

        return (await invite.save()).id;
    }

    public static async deleteExpired(): Promise<void> {
        await PublicInvite.delete({
            created: LessThan(moment().subtract(config.app.db.codeExpiryTimeInHour, 'hours').toDate())
        });
    }

    public static async findByToken(token: string): Promise<PublicInvite> {
        return PublicInvite.findOne({ where: { id: token } });
    }
}
