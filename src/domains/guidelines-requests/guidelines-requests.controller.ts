import { Controller, Get } from '@nestjs/common';
import { GuidelinesService } from '../guidelines/guidelines.service';
import Pagination from 'src/common/decorators/pagination';
import { PaginationParams } from 'src/types/pagination';
import Filter from 'src/common/decorators/filter';
import { FilterParams } from 'src/types/filter';

@Controller('guidelines-requests')
export class GuidelinesRequestsController {
  constructor(private readonly guidelinesService: GuidelinesService) {}

  @Get('pending')
  async findPendings(
    @Pagination() pagination: PaginationParams,
    @Filter() filters?: FilterParams,
  ) {
    return await this.guidelinesService.findAll({
      keyword: filters?.keyword,
      limit: pagination.limit,
      offset: pagination.offset,
      initialDate: filters?.initialDate,
      endDate: filters?.endDate,
      deficiences: filters?.deficiences,
      isRequest: true,
      isDeleted: filters?.isDeleted,
      statusCode: 'PENDING',
    });
  }

  @Get()
  async findAll(
    @Pagination() pagination: PaginationParams,
    @Filter() filters?: FilterParams,
  ) {
    return await this.guidelinesService.findAll({
      keyword: filters?.keyword,
      limit: pagination.limit,
      offset: pagination.offset,
      initialDate: filters?.initialDate,
      endDate: filters?.endDate,
      deficiences: filters?.deficiences,
      isRequest: false,
      isDeleted: filters?.isDeleted,
    });
  }
}
