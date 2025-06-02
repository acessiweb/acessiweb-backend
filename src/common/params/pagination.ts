import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  LIMIT_DEFAULT,
  MAX_LIMIT,
  MIN_LIMIT,
  OFFSET_DEFAULT,
} from '../constants/pagination';

export type PaginationParams = {
  limit?: number;
  offset?: number;
};

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const { limit: rawLimit, offset: rawOffset } = request.query;

    let limit = parseInt(rawLimit, 10);
    let offset = parseInt(rawOffset, 10);

    if (isNaN(limit) || limit < MIN_LIMIT || limit > MAX_LIMIT) {
      limit = LIMIT_DEFAULT;
    }

    if (isNaN(offset) || offset < 0) {
      offset = OFFSET_DEFAULT;
    }

    return {
      limit,
      offset,
    };
  },
);
