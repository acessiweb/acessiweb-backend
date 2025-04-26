import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { CommonUserService } from 'src/common-users/common-users.service';
import { GuidelinesService } from 'src/guidelines/guidelines.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private commonUserService: CommonUserService,
    private guidelinesService: GuidelinesService,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    const project = new Project();

    project.name = createProjectDto.name;
    project.description = createProjectDto.desc;

    const [user, guidelines] = await Promise.all([
      this.commonUserService.findOneBy(createProjectDto.userId),
      Promise.all(
        createProjectDto.guidelines.map((guide) =>
          this.guidelinesService.findOneBy(guide),
        ),
      ),
    ]);

    project.guidelines = guidelines;
    project.user = user;

    await this.projectRepository.save(project);

    return {
      id: project.id,
    };
  }
}
