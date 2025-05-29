import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { CustomHttpException } from 'src/common/exceptions/custom-http.exception';
import { QueryFailedError } from 'typeorm';
import { DUPLICATE_DATA } from 'src/common/errors/errors-codes';
import { ProjectsService } from 'src/projects/projects.service';
import { UpdateProjectDto } from 'src/projects/dto/update-project.dto';
import { CreateCommonUserProjectDto } from '../common-users/dto/create-common-user-project.dto';
import { throwHttpException } from 'src/common/errors/utils';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { Filter, FilterParams } from 'src/common/params/filter';
import { Pagination, PaginationParams } from 'src/common/params/pagination';
import { CommonUserService } from './common-users.service';

@UseGuards(AuthTokenGuard)
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
      } else if (e instanceof QueryFailedError) {
        if (e.message.includes('duplicar valor')) {
          throw new CustomHttpException(
            [
              {
                code: DUPLICATE_DATA,
                message:
                  'Não é permitido a mesma diretriz relacionada mais de uma vez com um mesmo projeto',
                fields: [],
              },
            ],
            HttpStatus.CONFLICT,
          );
        }
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
    @Pagination() pagination?: PaginationParams,
    @Filter() filters?: FilterParams,
  ) {
    try {
      await this.commonUserService.findOneBy(cuid);
      return await this.projectsService.findAll({
        commonUserId: cuid,
        keyword: filters.keyword,
        limit: pagination.limit,
        offset: pagination.offset,
        initialDate: filters.initialDate,
        endDate: filters.endDate,
      });
    } catch (e) {
      if (e instanceof CustomException) {
        throwHttpException(e);
      }
    }
  }
}
