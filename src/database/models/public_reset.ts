import { BaseEntity, Column, CreateDateColumn, Entity, LessThan, PrimaryGeneratedColumn } from 'typeorm';
import moment from 'moment';
import { config } from '../../config';

@Entity({ name: 'reset', schema: 'public' })
export class PublicReset extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column({ type: 'text' })
    public user_id: string;

    @Column({ type: 'text' })
    public email: string;

    @Column({ type: 'text' })
    public code: string;

    @CreateDateColumn()
    public created: Date;

    public static async checkResetEntry(
        email: string, code: string, resetToken?: string): Promise<{ valid: boolean, resetToken: string }> {
        const { id, code: dbCode, created, } = await PublicReset.findOne({ where: { email } });

        return {
            valid: code === dbCode &&
                moment().subtract(config.app.db.codeExpiryTimeInHour, 'hours').isBefore(created) &&
                (resetToken ? id === resetToken : true),
            resetToken: id
        }
    }

    public static createResetEntry(userId: string, email: string, code: string): void {
        const reset = new PublicReset();

        reset.user_id = userId;
        reset.email = email;
        reset.code = code;

        reset.save();
    }

    public static async deleteExpired(): Promise<void> {
        await PublicReset.delete({
            created: LessThan(moment().subtract(config.app.db.codeExpiryTimeInHour, 'hours').toDate())
        });
    }

    public static async deleteFromResetToken(resetToken: string): Promise<void> {
        await PublicReset.delete(resetToken);
    }
}
