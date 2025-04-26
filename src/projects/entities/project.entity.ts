import { CommonUser } from 'src/common-users/entities/common-user.entity';
import { Guideline } from 'src/guidelines/entities/guideline.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: '150', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'tsvector', nullable: true })
  descTsv: string;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @ManyToMany(() => Guideline)
  @JoinTable()
  guidelines: Guideline[];

  @ManyToOne(() => CommonUser, (user) => user.projects)
  user: CommonUser;

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
}
