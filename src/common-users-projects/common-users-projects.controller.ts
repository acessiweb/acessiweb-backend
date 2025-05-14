import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import CustomException from 'src/exceptions/custom-exception.exception';
import { CustomHttpException } from 'src/exceptions/custom-http.exception';
import { QueryFailedError } from 'typeorm';
import { DUPLICATE_DATA } from 'src/common/errors/errors-codes';
import { ProjectsService } from 'src/projects/projects.service';
import { UpdateProjectDto } from 'src/projects/dto/update-project.dto';
import { CreateCommonUserProjectDto } from './dto/create-common-user-project.dto';
import { throwHttpException } from 'src/common/errors/utils';
import { LIMIT_DEFAULT, OFFSET_DEFAULT } from 'src/common/constants/pagination';

@Controller('common-users/:cuid/projects')
export class CommonUserProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

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
        console.log(e);
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
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    try {
      return await this.projectsService.update(id, updateProjectDto);
    } catch (e) {
      if (e instanceof CustomException) {
        throwHttpException(e);
      }
    }
  }

  @Delete(':pid')
  async delete(@Param('id') id: string) {
    try {
      return await this.projectsService.delete(id);
    } catch (e) {}
  }

  @Get(':pid')
  async findOne(@Param('id') id: string) {
    try {
      return await this.projectsService.findOne(id);
    } catch (e) {}
  }

  @Get()
  async findAll(
    @Param('cuid', ParseUUIDPipe) cuid?: string,
    @Query('keyword') keyword?: string,
    @Query('limit', new DefaultValuePipe(LIMIT_DEFAULT), ParseIntPipe)
    limit?: number,
    @Query('offset', new DefaultValuePipe(OFFSET_DEFAULT), ParseIntPipe)
    offset?: number,
    @Query('initialDate') initialDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    try {
      return await this.projectsService.findAll({
        commonUserId: cuid,
        keyword,
        limit,
        offset,
        initialDate,
        endDate,
      });
    } catch (e) {
      console.error(e);
    }
  }
}
