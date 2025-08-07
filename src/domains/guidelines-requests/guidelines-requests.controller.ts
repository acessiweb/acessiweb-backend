import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { GuidelinesService } from '../guidelines/guidelines.service';
import Pagination from 'src/common/decorators/pagination';
import { PaginationParams } from 'src/types/pagination';
import Filter from 'src/common/decorators/filter';
import { GuidelineRequestFilter } from 'src/types/filter';
import { SetRoutePolicy } from 'src/services/auth/decorators/set-route-policy.decorator';
import { RoutePolicies } from 'src/services/auth/enum/route-policies.enum';
import { AuthTokenGuard } from 'src/services/auth/guards/auth-token.guard';
import { RoutePolicyGuard } from 'src/services/auth/guards/route-policy.guard';
import { UpdateStatusDto } from '../guidelines/dto/update-status.dto';
import { TokenPayloadParam } from 'src/services/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/services/auth/dto/token-payload.dto';
import { ACCESS_USER } from 'src/common/constants/access';

@Controller('guidelines-requests')
export class GuidelinesRequestsController {
  constructor(private readonly guidelinesService: GuidelinesService) {}

  @SetRoutePolicy(RoutePolicies.admin)
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @Patch(':gid')
  async updateStatus(
    @Param('gid') gid: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return await this.guidelinesService.updateStatus(gid, updateStatusDto);
  }

  @UseGuards(AuthTokenGuard)
  @Get()
  async findAll(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Pagination() pagination: PaginationParams,
    @Filter() filters?: GuidelineRequestFilter,
  ) {
    return await this.guidelinesService.findAll({
      keyword: filters?.keyword,
      limit: pagination.limit,
      offset: pagination.offset,
      initialDate: filters?.initialDate,
      endDate: filters?.endDate,
      deficiences: filters?.deficiences,
      isRequest: tokenPayload.role === ACCESS_USER ? filters?.isRequest : true,
      userId: tokenPayload.role === ACCESS_USER ? tokenPayload.sub : undefined,
      statusCode:
        tokenPayload.role === ACCESS_USER ? filters?.statusCode : 'PENDING',
    });
  }
}
