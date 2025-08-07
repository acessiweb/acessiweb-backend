import { HttpStatus, Injectable } from '@nestjs/common';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { GuidelinesService } from 'src/domains/guidelines/guidelines.service';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
  DELETE_OPERATION_FAILED,
  REQUIRED_FIELD,
  RESOURCE_NOT_FOUND,
  UPDATE_OPERATION_FAILED,
} from 'src/common/constants/errors';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { ProjectsRepository } from './projects.repository';
import { getIdsToAdd, getIdsToRemove } from 'src/common/utils/filter';
import { CommonUserService } from '../users/common-users/common-users.service';
import { ProjectQuery } from 'src/types/query';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly commonUserService: CommonUserService,
    private readonly guidelinesService: GuidelinesService,
    private readonly projRepo: ProjectsRepository,
  ) {}

  async getSanitizedArrayOfIds(ids: string[]) {
    const removedDuplicate = new Set(ids);

    const data = [];

    for (let rd of removedDuplicate) {
      try {
        const found = await this.guidelinesService.findOne(rd);

        if (found.statusCode === 'APPROVED' && !found.isRequest) {
          data.push(found);
        }
      } catch (e) {
        console.error(e);
      }
    }

    return data;
  }

  async create(userId: string, createProjectDto: CreateProjectDto) {
    const [user, guidelines] = await Promise.all([
      this.commonUserService.findOneBy(userId),
      this.getSanitizedArrayOfIds(createProjectDto.guidelines),
    ]);

    if (guidelines.length === 0) {
      throw new CustomException(
        'O projeto precisa ter ao menos uma diretriz válida relacionada',
        REQUIRED_FIELD,
        ['guidelines'],
        HttpStatus.BAD_REQUEST,
      );
    }

    const project = new Project();
    project.name = createProjectDto.name;
    project.description = createProjectDto.desc;
    project.guidelines = guidelines;
    project.user = user;

    const projectSaved = await this.projRepo.create(project);

    return {
      id: projectSaved.id,
    };
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.findOne(id);
    const currentIds = project.guidelines.map((guide) => guide.id);

    const [updated] = await this.projRepo.update(
      id,
      updateProjectDto.name,
      updateProjectDto.desc,
      updateProjectDto.feedback,
      getIdsToAdd(currentIds, updateProjectDto.guidelines),
      getIdsToRemove(currentIds, updateProjectDto.guidelines),
    );

    const updatedProj = await this.findOne(id);

    if (
      (updated.affected && updated.affected > 0) ||
      project.guidelines !== updatedProj.guidelines
    ) {
      return await this.findOne(id);
    }

    throw new CustomException(
      `Não foi possível atualizar projeto id ${id}`,
      UPDATE_OPERATION_FAILED,
      [],
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async delete(id: string) {
    await this.findOne(id);
    const deleted = await this.projRepo.delete(id);

    if (deleted.affected && deleted.affected > 0) {
      return {
        id,
      };
    }

    throw new CustomException(
      `Não foi possível deletar projeto id ${id}`,
      DELETE_OPERATION_FAILED,
      [],
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async findOne(id: string) {
    const project = await this.projRepo.findOne(id);
    if (project) return project;
    throw new CustomException(
      `Projeto com id ${id} não encontrado`,
      RESOURCE_NOT_FOUND,
    );
  }

  async findAll(userId: string, query: ProjectQuery) {
    return await this.projRepo.findAll(userId, query);
  }
}
