import { User } from 'src/users/entities/user.entity';
import { Deficiency } from 'src/deficiences/entities/deficiences.entity';
import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Check(`UPPER("statusCode") IN ('APPROVED', 'PENDING', 'REJECTED', 'DELETED')`)
@Entity()
export class Guideline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150, nullable: false, unique: true })
  name: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'text', nullable: true })
  code: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image: string;

  @Column({ type: 'varchar', nullable: true })
  imageId: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  imageDesc: string;

  @ManyToMany(() => Deficiency)
  @JoinTable()
  deficiences: Deficiency[];

  @Column({ type: 'varchar', length: 10, nullable: false })
  statusCode: string;

  @Column({ type: 'text', nullable: true })
  statusMsg: string;

  @ManyToOne(() => User, (user) => user.guidelines)
  user: User;

  @Column({ type: 'boolean', nullable: false })
  isRequest: boolean;

  @CreateDateColumn({
    type: 'timestamp without time zone',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp without time zone',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp without time zone', nullable: true })
  deletedAt: Date;
}
