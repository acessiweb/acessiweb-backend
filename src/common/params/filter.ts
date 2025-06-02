import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type FilterParams = {
  keyword?: string;
  initialDate?: Date;
  endDate?: Date;
};

export const Filter = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const { keyword, initialDate, endDate } = request.query;

    return {
      keyword,
      initialDate: initialDate ? new Date(initialDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };
  },
);
