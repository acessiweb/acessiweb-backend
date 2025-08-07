import { Injectable } from '@nestjs/common';
import { Brackets, ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { transformDateToDatetime } from 'src/common/utils/date';

@Injectable()
export class FilterRepository {
  queryKeyword<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    dbEntityName: string,
    keyword: string,
  ) {
    qb.andWhere(
      new Brackets((qb) => {
        qb.where(`${dbEntityName}.name ILIKE :keyword`, {
          keyword: `%${keyword}%`,
        }).orWhere(
          `to_tsvector('portuguese', ${dbEntityName}.description) @@ plainto_tsquery('portuguese', :q)`,
          {
            q: keyword,
          },
        );
      }),
    );
  }

  async queryInitialDate<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    dbEntityName: string,
    initialDate: string,
  ) {
    qb.andWhere(`${dbEntityName}.createdAt >= :initialDate`, {
      initialDate: transformDateToDatetime(initialDate),
    });
  }

  queryEndDate<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    dbEntityName: string,
    endDate: string,
  ) {
    qb.andWhere(`${dbEntityName}.createdAt <= :endDate`, {
      endDate: transformDateToDatetime(endDate),
    });
  }

  queryInitialAndEndDate<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    dbEntityName: string,
    initialDate: string,
    endDate: string,
  ) {
    qb.andWhere(`${dbEntityName}.createdAt BETWEEN :initialDate AND :endDate`, {
      initialDate: transformDateToDatetime(initialDate),
      endDate: transformDateToDatetime(endDate),
    });
  }
}
