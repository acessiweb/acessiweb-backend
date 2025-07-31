import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const Filter = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  const { keyword, initialDate, endDate, deficiences, statusCode, isDeleted } =
    request.query;

  const iDate = new Date(initialDate);
  const eDate = new Date(endDate);

  return {
    keyword,
    initialDate: isNaN(iDate.getTime()) ? undefined : iDate,
    endDate: isNaN(eDate.getTime()) ? undefined : eDate,
    deficiences,
    statusCode,
    isDeleted: isDeleted === 'true' ? true : false,
  };
});

export default Filter;
