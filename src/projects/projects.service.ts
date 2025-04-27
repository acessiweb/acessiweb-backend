import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { CommonUserService } from 'src/common-users/common-users.service';
import { GuidelinesService } from 'src/guidelines/guidelines.service';
import { UpdateProjectDto } from './dto/update-project.dto';
import { DataSource } from 'typeorm';
import { Guideline } from 'src/guidelines/entities/guideline.entity';
import { compareArrays } from 'src/common/utils/compare';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private commonUserService: CommonUserService,
    private guidelinesService: GuidelinesService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<{ id: string }> {
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

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<{
    id: string;
    name: string;
    description: string;
    feedback: string;
    guidelines: Guideline[];
  }> {
    const [projectUpdated, guidelinesUpdated] = await Promise.all([
      this.projectRepository
        .createQueryBuilder()
        .update(Project)
        .set({
          name: updateProjectDto.name,
          description: updateProjectDto.desc,
          feedback: updateProjectDto.feedback,
        })
        .where('id = :id', { id: id })
        .returning(['name', 'description', 'feedback'])
        .execute(),
      this.updateGuidelines(id, updateProjectDto.guidelines),
    ]);

    const { name, description, feedback } = projectUpdated.raw[0];

    return {
      id,
      name,
      description,
      feedback,
      guidelines: guidelinesUpdated,
    };
  }

  private async getGuidelinesWithValues(
    projectId: string,
  ): Promise<Guideline[]> {
    const sql = `
      SELECT g.id, g.name, g.description
      FROM guideline g
      JOIN project_guidelines_guideline pg
        ON pg."guidelineId" = g.id
      WHERE pg."projectId" = '${projectId}'; 
    `;

    return await this.dataSource.query(sql);
  }

  private async updateGuidelines(
    projectId: string,
    guides: UpdateProjectDto['guidelines'],
  ) {
    const currentGuides = await this.getGuidelinesWithValues(projectId);

    const currentIds = currentGuides.map((guide) => guide.id);

    if (compareArrays(guides, currentIds)) {
      return currentGuides;
    }

    await Promise.all(
      guides.map((guide) => this.guidelinesService.findOneBy(guide)),
    );

    const toRemove = currentIds.filter((id) => !guides.includes(id));

    const toAdd = guides.filter((id) => !currentIds.includes(id));

    if (toRemove.length) {
      await this.dataSource
        .createQueryBuilder()
        .relation(Project, 'guidelines')
        .of(projectId)
        .remove(toRemove);
    }

    if (toAdd.length) {
      await this.dataSource
        .createQueryBuilder()
        .relation(Project, 'guidelines')
        .of(projectId)
        .add(toAdd);
    }

    const newGuides = await this.getGuidelinesWithValues(projectId);

    return newGuides;
  }
}
