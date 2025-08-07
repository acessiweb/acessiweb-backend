import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectsService } from './projects.service';
import { GuidelinesModule } from 'src/domains/guidelines/guidelines.module';
import { ProjectsRepository } from './projects.repository';
import { CommonUserModule } from '../users/common-users/common-users.module';
import { ProjectsController } from './projects.controller';
import { FilterRepository } from 'src/common/repositories/filter.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    CommonUserModule,
    GuidelinesModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectsRepository, FilterRepository],
  exports: [ProjectsService, ProjectsRepository],
})
export class ProjectsModule {}
