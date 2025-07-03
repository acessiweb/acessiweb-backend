import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository, UpdateResult } from 'typeorm';
import { Guideline } from 'src/guidelines/entities/guideline.entity';
import { Deficiency } from 'src/deficiences/entities/deficiences.entity';
import { getPagination } from 'src/common/utils/pagination';

@Injectable()
export class GuidelinesRepository {
  constructor(
    @InjectRepository(Guideline)
    private readonly guidelineRepository: Repository<Guideline>,
    private readonly dataSource: DataSource,
  ) {}

  private async findAllGuidelineDeficiencies(
    guidelineId: string,
  ): Promise<Guideline[]> {
    const sql = `
        SELECT d.id, d.name
        FROM deficiency d
        JOIN guideline_deficiences_deficiency gd
          ON gd."guidelineId" = d.id
        WHERE gd."guidelineId" = '${guidelineId}'
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
    guideCode: string,
    guideImage: string,
    guideImageId: string,
    guideImageDesc: string,
    deficiencesToAdd: string[],
    deficiencesToRemove: string[],
    guideStatusCode?: string,
    guideStatusMsg?: string,
  ): Promise<{
    id: string;
    name: string;
    description: string;
    code: string;
    image: string;
    imageDesc: string;
    deficiences: Deficiency[];
    statusCode: string;
    statusMsg: string;
  }> {
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

    const dataToUpdate: {
      name: string;
      description: string;
      code: string;
      image: string;
      imageId: string;
      imageDesc: string;
      guideStatusCode?: string;
      guideStatusMsg?: string;
    } = {
      name: guideName,
      description: guideDesc,
      code: guideCode,
      image: guideImage,
      imageId: guideImageId,
      imageDesc: guideImageDesc,
    };

    if (guideStatusCode || guideStatusMsg) {
      dataToUpdate['guideStatusCode'] = guideStatusCode;
      dataToUpdate['guideStatusMsg'] = guideStatusMsg;
    }

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

  async findAll(query: {
    limit: number;
    offset: number;
    userId?: string;
    deficiences?: string[];
    statusCode?: string;
    keyword?: string;
    initialDate?: Date;
    endDate?: Date;
    isRequest?: boolean;
  }): Promise<PaginationResponse> {
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
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('guideline.name ILIKE :keyword', {
            keyword: `%${query.keyword}%`,
          }).orWhere(
            "to_tsvector('portuguese', guideline.description) @@ plainto_tsquery('portuguese', :q)",
            {
              q: query.keyword,
            },
          );
        }),
      );
    }

    if (query.initialDate && !query.endDate) {
      const date = query.initialDate.toISOString().slice(0, 10);

      qb.andWhere('DATE(guideline.createdAt) >= :initialDate', {
        initialDate: date,
      });
    }

    if (!query.initialDate && query.endDate) {
      const date = query.endDate.toISOString().slice(0, 10);
      qb.andWhere('guideline.createdAt <= :endDate', {
        endDate: date,
      });
    }

    if (query.initialDate && query.endDate) {
      const initialDate = query.initialDate.toISOString().slice(0, 10);
      const endDate = query.endDate.toISOString().slice(0, 10);

      qb.andWhere('guideline.createdAt BETWEEN :initialDate AND :endDate', {
        initialDate: initialDate,
        endDate: endDate,
      });
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

    if (query.isRequest) {
      qb.andWhere('guideline.isRequest = :isRequest', {
        isRequest: query.isRequest,
      });
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
