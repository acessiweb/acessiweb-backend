import { Controller, Get, Param } from '@nestjs/common';
import { GuidelinesService } from './guidelines.service';
import { Pagination, PaginationParams } from 'src/common/params/pagination';
import { Filter, FilterParams } from 'src/common/params/filter';

@Controller('guidelines')
export class GuidelinesController {
  constructor(private readonly guidelinesService: GuidelinesService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.guidelinesService.findOne(id);
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
      isRequest: filters?.isRequest,
    });
  }
}
