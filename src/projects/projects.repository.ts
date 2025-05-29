import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Brackets, DataSource, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class ProjectsRepository {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private readonly dataSource: DataSource,
  ) {}

  async update(
    id: string,
    projName: string,
    projDesc: string,
    projFeedback: string,
    guidesToAdd: string[],
    guidesToRemove: string[],
  ): Promise<Project> {
    await Promise.all([
      this.projectRepository.update(id, {
        name: projName,
        description: projDesc,
        feedback: projFeedback,
      }),
      this.dataSource
        .createQueryBuilder()
        .relation(Project, 'guidelines')
        .of(id)
        .add(guidesToAdd),
      this.dataSource
        .createQueryBuilder()
        .relation(Project, 'guidelines')
        .of(id)
        .remove(guidesToRemove),
    ]);

    return await this.findOne(id);
  }

  async delete(id: string): Promise<UpdateResult> {
    return await this.projectRepository.softDelete(id);
  }

  async findOne(id: string): Promise<Project> {
    return this.projectRepository.findOne({
      where: { id },
      relations: {
        guidelines: true,
      },
    });
  }

  async findAll(query: {
    commonUserId?: string;
    keyword?: string;
    limit?: number;
    offset?: number;
    initialDate?: Date;
    endDate?: Date;
  }): Promise<Project[]> {
    const qb = this.projectRepository
      .createQueryBuilder('project')
      .limit(query.limit)
      .offset(query.offset)
      .cache(true);

    if (query.commonUserId) {
      qb.where('project.userId = :commonUserId', {
        commonUserId: query.commonUserId,
      });
    }

    if (query.keyword) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('project.name ILIKE :keyword', {
            keyword: `%${query.keyword}%`,
          }).orWhere(
            "to_tsvector('portuguese', project.description) @@ plainto_tsquery('portuguese', :q)",
            {
              q: query.keyword,
            },
          );
        }),
      );
    }

    if (query.initialDate && !query.endDate) {
      qb.andWhere('project.createdAt >= :initialDate', {
        initialDate: query.initialDate,
      });
    }

    if (!query.initialDate && query.endDate) {
      qb.andWhere('project.createdAt <= :endDate', { endDate: query.endDate });
    }

    if (query.initialDate && query.endDate) {
      qb.andWhere('project.createdAt BETWEEN :initialDate AND :endDate', {
        initialDate: query.initialDate,
        endDate: query.endDate,
      });
    }

    return qb.getMany();
  }

  async create(project: Project): Promise<Project> {
    return this.projectRepository.save(project);
  }
}
