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

  @Column({ type: 'bytea', nullable: true })
  emailHash: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  mobilePhone: string;

  @Column({ type: 'bytea', nullable: true })
  mobilePhoneHash: string;

  @Column({ type: 'bytea' })
  password: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
