import { User } from 'src/domains/users/entities/user.entity';
import { Project } from 'src/domains/projects/entities/project.entity';
import {
  Check,
  ChildEntity,
  Column,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';

@ChildEntity('user')
@Check(`"username" ~ '^[A-Za-z0-9 _]+$'`)
export class CommonUser extends User {
  @Column({ type: 'varchar', length: 25, nullable: false })
  username: string;

  @OneToMany(() => Project, (project) => project.user)
  projects: Project[];

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt: Date;
}
