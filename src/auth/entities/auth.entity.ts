import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  email: string;

  @Column({ type: 'bytea', nullable: true, unique: true })
  emailHash: string;

  @Column({ type: 'boolean', nullable: true, default: null })
  isEmailVerified: boolean;

  @Column({ type: 'varchar', nullable: true, unique: true })
  verificationToken: string;

  @Column({
    type: 'timestamp without time zone',
    nullable: true,
  })
  verificationTokenExpiry: Date;

  @Column({ default: 0 })
  emailVerificationAttempts: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  mobilePhone: string;

  @Column({ type: 'bytea', nullable: true, unique: true })
  mobilePhoneHash: string;

  @Column({ type: 'boolean', nullable: true, default: null })
  isMobilePhoneVerified: boolean;

  @Column({ type: 'varchar', nullable: true, unique: true })
  smsVerificationCode: string;

  @Column({
    type: 'timestamp without time zone',
    nullable: true,
  })
  smsVerificationCodeExpiry: Date;

  @Column({ default: 0 })
  smsVerificationAttempts: number;

  @Column({ type: 'boolean', nullable: true, default: true })
  active: boolean;

  @Column({ type: 'bytea' })
  password: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
