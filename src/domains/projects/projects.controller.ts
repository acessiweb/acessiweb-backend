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
import { ProjectsService } from 'src/domains/projects/projects.service';
import { UpdateProjectDto } from 'src/domains/projects/dto/update-project.dto';
import { AuthTokenGuard } from 'src/services/auth/guards/auth-token.guard';
import { SetRoutePolicy } from 'src/services/auth/decorators/set-route-policy.decorator';
import { RoutePolicies } from 'src/services/auth/enum/route-policies.enum';
import { RoutePolicyGuard } from 'src/services/auth/guards/route-policy.guard';
import { TokenPayloadParam } from 'src/services/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/services/auth/dto/token-payload.dto';
import { CommonUserService } from '../users/common-users/common-users.service';
import { CreateProjectDto } from './dto/create-project.dto';
import Pagination from 'src/common/decorators/pagination';
import { PaginationParams } from 'src/types/pagination';
import Filter from 'src/common/decorators/filter';
import { FilterParams } from 'src/types/filter';

@SetRoutePolicy(RoutePolicies.user)
@UseGuards(AuthTokenGuard, RoutePolicyGuard)
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly commonUserService: CommonUserService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Post()
  async create(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    return await this.projectsService.create(
      tokenPayload.sub,
      createProjectDto,
    );
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
