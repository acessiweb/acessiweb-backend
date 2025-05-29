import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectsService } from './projects.service';
import { CommonUserModule } from 'src/common-users/common-users.module';
import { GuidelinesModule } from 'src/guidelines/guidelines.module';
import { ProjectsRepository } from './projects.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    CommonUserModule,
    GuidelinesModule,
  ],
  providers: [ProjectsService, ProjectsRepository],
  exports: [ProjectsService, ProjectsRepository],
})
export class ProjectsModule {}
