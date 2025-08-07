import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { DataSource, DeleteResult, Repository, UpdateResult } from 'typeorm';
import { getPagination } from 'src/common/utils/pagination';
import { PaginationResponse } from 'src/types/pagination';
import { FilterRepository } from 'src/common/repositories/filter.repository';
import { ProjectQuery } from 'src/types/query';

@Injectable()
export class ProjectsRepository {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private readonly dataSource: DataSource,
    private readonly filterRepository: FilterRepository,
  ) {}

  async update(
    id: string,
    projName: string,
    projDesc: string,
    projFeedback: string,
    guidesToAdd: string[],
    guidesToRemove: string[],
  ): Promise<[UpdateResult, void, void]> {
    return await Promise.all([
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
  }

  async delete(id: string): Promise<DeleteResult> {
    return await this.projectRepository.delete(id);
  }

  async findOne(id: string): Promise<Project | null> {
    return await this.projectRepository.findOne({
      where: { id },
      relations: {
        guidelines: true,
      },
    });
  }

  async findAll(
    userId: string,
    query: ProjectQuery,
  ): Promise<PaginationResponse> {
    const qb = this.projectRepository
      .createQueryBuilder('project')
      .limit(query.limit)
      .offset(query.offset)
      .leftJoinAndSelect('project.guidelines', 'guidelines')
      .cache(true)
      .where('project."userId" = :userId', {
        userId: userId,
      });

    if (query.keyword) {
      this.filterRepository.queryKeyword(qb, 'project', query.keyword);
    }

    if (query.initialDate && !query.endDate) {
      this.filterRepository.queryInitialDate(qb, 'project', query.initialDate);
    }

    if (!query.initialDate && query.endDate) {
      this.filterRepository.queryEndDate(qb, 'project', query.endDate);
    }

    if (query.initialDate && query.endDate) {
      this.filterRepository.queryInitialAndEndDate(
        qb,
        'project',
        query.initialDate,
        query.endDate,
      );
    }

    const [data, total] = await qb.getManyAndCount();

    const pagination = getPagination(query.offset, query.limit, total);

    return {
      data,
      total,
      limit: query.limit,
      ...pagination,
    };
  }

  async create(project: Project): Promise<Project> {
    return await this.projectRepository.save(project);
  }
}
