import { Module } from '@nestjs/common';
import { ProjectsModule } from 'src/projects/projects.module';
import { CommonUserProjectsController } from './common-users-projects.controller';
import { CommonUserModule } from './common-users.module';

@Module({
  imports: [ProjectsModule, CommonUserModule],
  controllers: [CommonUserProjectsController],
})
export class CommonUsersProjectsModule {}
