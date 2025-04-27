import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';
import CustomException from 'src/exceptions/custom-exception.exception';
import { CustomHttpException } from 'src/exceptions/custom-http.exception';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryFailedError } from 'typeorm';
import { DUPLICATE_DATA } from 'src/common/errors/errors-codes';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto) {
    try {
      return await this.projectsService.create(createProjectDto);
    } catch (e) {
      if (e instanceof CustomException) {
        throw new CustomHttpException(
          [
            {
              code: e.errorCode,
              message: e.message,
            },
          ],
          e.httpErrorCode,
        );
      } else if (e instanceof QueryFailedError) {
        console.log(e);
        if (e.message.includes('duplicar valor')) {
          throw new CustomHttpException(
            [
              {
                code: DUPLICATE_DATA,
                message:
                  'Não é permitido a mesma diretriz relacionada mais de uma vez com um mesmo projeto',
              },
            ],
            HttpStatus.CONFLICT,
          );
        }
      }
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    try {
      return await this.projectsService.update(id, updateProjectDto);
    } catch (e) {
      if (e instanceof CustomException) {
        throw new CustomHttpException(
          [
            {
              code: e.errorCode,
              message: e.message,
            },
          ],
          e.httpErrorCode,
        );
      }
    }
  }
}
