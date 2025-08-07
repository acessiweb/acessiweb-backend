import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GuidelineFilter, GuidelineRequestFilter } from 'src/types/filter';

const Filter = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  const {
    keyword,
    initialDate,
    endDate,
    deficiences,
    statusCode,
    isDeleted,
    isRequest,
  } = request.query as GuidelineFilter & GuidelineRequestFilter;

  return {
    keyword,
    initialDate,
    endDate,
    deficiences,
    statusCode,
    isDeleted: isDeleted === 'true' ? true : false,
    isRequest: isRequest === 'true' ? true : false,
  };
});

export default Filter;
