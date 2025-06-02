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
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { ProjectsService } from 'src/projects/projects.service';
import { UpdateProjectDto } from 'src/projects/dto/update-project.dto';
import { CreateCommonUserProjectDto } from '../common-users/dto/create-common-user-project.dto';
import { throwHttpException } from 'src/common/errors/utils';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { Filter, FilterParams } from 'src/common/params/filter';
import { Pagination, PaginationParams } from 'src/common/params/pagination';
import { CommonUserService } from './common-users.service';
import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';
import { RoutePolicies } from 'src/auth/enum/route-policies.enum';
import { RoutePolicyGuard } from 'src/auth/guards/route-policy.guard';

@SetRoutePolicy(RoutePolicies.user)
@UseGuards(AuthTokenGuard, RoutePolicyGuard)
@Controller('common-users/:cuid/projects')
export class CommonUserProjectsController {
  constructor(
    private readonly commonUserService: CommonUserService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Post()
  async create(
    @Param('cuid') cuid: string,
    @Body() createCommonUserProjectDto: CreateCommonUserProjectDto,
  ) {
    try {
      return await this.projectsService.create({
        ...createCommonUserProjectDto,
        userId: cuid,
      });
    } catch (e) {
      if (e instanceof CustomException) {
        throwHttpException(e);
      }
    }
  }

  @Put(':pid')
  async update(
    @Param('pid') pid: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    try {
      return await this.projectsService.update(pid, updateProjectDto);
    } catch (e) {
      if (e instanceof CustomException) {
        throwHttpException(e);
      }
    }
  }

  @Delete(':pid')
  async delete(@Param('pid', ParseUUIDPipe) pid: string) {
    try {
      return await this.projectsService.delete(pid);
    } catch (e) {
      if (e instanceof CustomException) {
        throwHttpException(e);
      }
    }
  }

  @Get(':pid')
  async findOne(@Param('pid') pid: string) {
    try {
      return await this.projectsService.findOne(pid);
    } catch (e) {
      if (e instanceof CustomException) {
        throwHttpException(e);
      }
    }
  }

  @Get()
  async findAll(
    @Param('cuid', ParseUUIDPipe) cuid: string,
    @Pagination() pagination: PaginationParams,
    @Filter() filters?: FilterParams,
  ) {
    await this.commonUserService.findOneBy(cuid);
    return await this.projectsService.findAll({
      commonUserId: cuid,
      keyword: filters?.keyword,
      limit: pagination.limit,
      offset: pagination.offset,
      initialDate: filters?.initialDate,
      endDate: filters?.endDate,
    });
  }
}
