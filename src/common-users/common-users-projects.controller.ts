import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from 'src/projects/projects.service';
import { UpdateProjectDto } from 'src/projects/dto/update-project.dto';
import { CreateCommonUserProjectDto } from '../common-users/dto/create-common-user-project.dto';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { Filter, FilterParams } from 'src/common/params/filter';
import { Pagination, PaginationParams } from 'src/common/params/pagination';
import { CommonUserService } from './common-users.service';
import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';
import { RoutePolicies } from 'src/auth/enum/route-policies.enum';
import { RoutePolicyGuard } from 'src/auth/guards/route-policy.guard';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

@SetRoutePolicy(RoutePolicies.user)
@UseGuards(AuthTokenGuard, RoutePolicyGuard)
@Controller('common-users/me/projects')
export class CommonUserProjectsController {
  constructor(
    private readonly commonUserService: CommonUserService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Post()
  async create(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Body() createCommonUserProjectDto: CreateCommonUserProjectDto,
  ) {
    return await this.projectsService.create({
      ...createCommonUserProjectDto,
      userId: tokenPayload.sub,
    });
  }

  @Put(':pid')
  async update(
    @Param('pid') pid: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return await this.projectsService.update(pid, updateProjectDto);
  }

  @Delete(':pid')
  async delete(@Param('pid', ParseUUIDPipe) pid: string) {
    return await this.projectsService.delete(pid);
  }

  @Get()
  async findAll(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Pagination() pagination: PaginationParams,
    @Filter() filters?: FilterParams,
  ) {
    await this.commonUserService.findOneBy(tokenPayload.sub);
    return await this.projectsService.findAll({
      commonUserId: tokenPayload.sub,
      limit: pagination.limit,
      offset: pagination.offset,
      keyword: filters?.keyword,
      initialDate: filters?.initialDate,
      endDate: filters?.endDate,
    });
  }

  @Get(':pid')
  async findOne(@Param('pid') pid: string) {
    return await this.projectsService.findOne(pid);
  }
}
