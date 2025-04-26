import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { CommonUserModule } from 'src/common-users/common-users.module';
import { GuidelinesModule } from 'src/guidelines/guidelines.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    CommonUserModule,
    GuidelinesModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
