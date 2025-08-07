import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, UpdateResult } from 'typeorm';
import { Guideline } from 'src/domains/guidelines/entities/guideline.entity';
import { getPagination } from 'src/common/utils/pagination';
import {
  GuidelineStatus,
  Guideline as GuidelineType,
} from 'src/types/guideline';
import { PaginationResponse } from 'src/types/pagination';
import { FilterRepository } from 'src/common/repositories/filter.repository';
import { GuidelineQuery } from 'src/types/query';

@Injectable()
export class GuidelinesRepository {
  constructor(
    @InjectRepository(Guideline)
    private readonly guidelineRepository: Repository<Guideline>,
    private readonly dataSource: DataSource,
    private readonly filterRepository: FilterRepository,
  ) {}

  private async findAllGuidelineDeficiencies(
    guidelineId: string,
  ): Promise<Guideline[]> {
    const sql = `
        SELECT d.id, d.name
        FROM deficiency d
        JOIN guideline_deficiences_deficiency gd
        ON d.id=gd."deficiencyId"
        WHERE gd."guidelineId" = '${guidelineId}';
      `;

    return this.dataSource.query(sql);
  }

  private async removeDeficiences(
    guidelineId: string,
    deficiencesToRemove: string[],
  ) {
    this.dataSource
      .createQueryBuilder()
      .relation(Guideline, 'deficiences')
      .of(guidelineId)
      .remove(deficiencesToRemove);
  }

  private async addDeficiences(
    guidelineId: string,
    deficiencesToAdd: string[],
  ) {
    this.dataSource
      .createQueryBuilder()
      .relation(Guideline, 'deficiences')
      .of(guidelineId)
      .add(deficiencesToAdd);
  }

  async update(
    id: string,
    guideName: string,
    guideDesc: string,
    guideCode: string | undefined,
    guideImage: string,
    guideImageId: string,
    guideImageDesc: string | undefined,
    deficiencesToAdd: string[],
    deficiencesToRemove: string[],
  ): Promise<GuidelineType> {
    const addDefs = async () => {
      if (deficiencesToAdd.length > 0) {
        this.addDeficiences(id, deficiencesToAdd);
      }
    };

    const removeDefs = async () => {
      if (deficiencesToRemove.length > 0) {
        this.removeDeficiences(id, deficiencesToRemove);
      }
    };

    const dataToUpdate = {
      name: guideName,
      description: guideDesc,
      code: guideCode,
      image: guideImage,
      imageId: guideImageId,
      imageDesc: guideImageDesc,
    };

    const [guideline] = await Promise.all([
      this.guidelineRepository
        .createQueryBuilder()
        .update(Guideline)
        .set(dataToUpdate)
        .where('id = :id', { id })
        .returning([
          'name',
          'description',
          'code',
          'image',
          'imageDesc',
          'statusCode',
          'statusMsg',
        ])
        .execute(),
      addDefs,
      removeDefs,
    ]);

    const { name, description, code, image, imageDesc, statusCode, statusMsg } =
      guideline.raw[0];

    const deficiences = await this.findAllGuidelineDeficiencies(id);

    return {
      id,
      name,
      description,
      code,
      image,
      imageDesc,
      deficiences,
      statusCode,
      statusMsg,
    };
  }

  async updateStatus(
    id: string,
    guideStatusCode?: GuidelineStatus,
    guideStatusMsg?: string,
  ): Promise<GuidelineType> {
    const dataToUpdate = {} as {
      statusCode: GuidelineStatus;
      statusMsg: string;
    };

    if (guideStatusCode) {
      dataToUpdate['statusCode'] = guideStatusCode;
    }

    if (guideStatusMsg) {
      dataToUpdate['statusMsg'] = guideStatusMsg;
    }

    const guideline = await this.guidelineRepository
      .createQueryBuilder()
      .update(Guideline)
      .set(dataToUpdate)
      .where('id = :id', { id })
      .returning([
        'name',
        'description',
        'code',
        'image',
        'imageDesc',
        'statusCode',
        'statusMsg',
      ])
      .execute();

    const { name, description, code, image, imageDesc, statusCode, statusMsg } =
      guideline.raw[0];

    const deficiences = await this.findAllGuidelineDeficiencies(id);

    return {
      id,
      name,
      description,
      code,
      image,
      imageDesc,
      deficiences,
      statusCode,
      statusMsg,
    };
  }

  async delete(id: string): Promise<UpdateResult> {
    return await this.guidelineRepository.softDelete(id);
  }

  async findOne(id: string): Promise<Guideline | null> {
    return this.guidelineRepository.findOne({
      where: { id },
      relations: {
        deficiences: true,
        user: true,
      },
    });
  }

  async findAll(query: GuidelineQuery): Promise<PaginationResponse> {
    const qb = this.guidelineRepository
      .createQueryBuilder('guideline')
      .leftJoinAndSelect('guideline.deficiences', 'deficiences')
      .orderBy('guideline.createdAt', 'ASC')
      .skip(query.offset)
      .take(query.limit)
      .cache(true);

    if (query.userId) {
      qb.where('guideline.userId = :userId', {
        userId: query.userId,
      });
    }

    if (query.keyword) {
      this.filterRepository.queryKeyword(qb, 'guideline', query.keyword);
    }

    if (query.initialDate && !query.endDate) {
      this.filterRepository.queryInitialDate(
        qb,
        'guideline',
        query.initialDate,
      );
    }

    if (!query.initialDate && query.endDate) {
      this.filterRepository.queryEndDate(qb, 'guideline', query.endDate);
    }

    if (query.initialDate && query.endDate) {
      this.filterRepository.queryInitialAndEndDate(
        qb,
        'guideline',
        query.initialDate,
        query.endDate,
      );
    }

    if (query.deficiences && query.deficiences.length > 0) {
      let deficiences = query.deficiences.toString().split(',');
      deficiences = deficiences.filter((def) => def);
      const lowerCaseDeficiences = deficiences.map((name) =>
        name.toLowerCase(),
      );

      if (deficiences && deficiences.length > 0) {
        qb.andWhere('LOWER(deficiences.name) IN (:...names)', {
          names: lowerCaseDeficiences,
        });
      }
    }

    if ('isRequest' in query) {
      qb.andWhere('guideline.isRequest = :isRequest', {
        isRequest: query.isRequest,
      });
    }

    if ('isDeleted' in query && query.isDeleted) {
      qb.withDeleted();
      qb.andWhere('guideline.deletedAt IS NOT NULL');
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

  async create(guideline: Guideline): Promise<Guideline> {
    return this.guidelineRepository.save(guideline);
  }
}
