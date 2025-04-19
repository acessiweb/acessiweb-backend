import { User } from 'src/common/user.entity';
import { Project } from 'src/projects/entities/project.entity';
import { ChildEntity, Column, ManyToMany, OneToMany } from 'typeorm';

@ChildEntity('common')
export class CommonUser extends User {
  @Column({ type: 'varchar', length: 50, nullable: false })
  username: string;

  @OneToMany(() => Project, (project) => project.user)
  projects: Project[];
}
