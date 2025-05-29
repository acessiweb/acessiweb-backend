import { Module } from '@nestjs/common';
import { ProjectsModule } from 'src/projects/projects.module';
import { CommonUserProjectsController } from './common-users-projects.controller';

@Module({
  imports: [ProjectsModule],
  controllers: [CommonUserProjectsController],
})
export class CommonUsersProjectsModule {}
