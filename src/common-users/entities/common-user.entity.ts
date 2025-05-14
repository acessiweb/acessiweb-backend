import { User } from 'src/users/entities/user.entity';
import { Project } from 'src/projects/entities/project.entity';
import { Check, ChildEntity, Column, OneToMany } from 'typeorm';

@ChildEntity('common')
@Check(`"username" ~ '^[A-Za-z0-9]+$'`)
export class CommonUser extends User {
  @Column({ type: 'varchar', length: 30, nullable: false })
  username: string;

  @OneToMany(() => Project, (project) => project.user)
  projects: Project[];
}
