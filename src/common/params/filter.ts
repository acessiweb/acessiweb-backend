import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type FilterParams = {
  keyword?: string;
  initialDate?: Date;
  endDate?: Date;
  deficiences?: string[];
  statusCode?: string;
  isRequest?: boolean;
};

export const Filter = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const {
      keyword,
      initialDate,
      endDate,
      deficiences,
      statusCode,
      isRequest,
    } = request.query;

    return {
      keyword,
      initialDate: initialDate ? new Date(initialDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      deficiences,
      statusCode,
      isRequest,
    };
  },
);
