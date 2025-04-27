import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { CreateGuidelineDto } from './dto/create-guideline.dto';
import { GuidelinesService } from './guidelines.service';
import CustomException from 'src/exceptions/custom-exception.exception';
import { CustomHttpException } from 'src/exceptions/custom-http.exception';
import { UpdateGuidelineDto } from './dto/update-guideline.dto';

@Controller('guidelines')
export class GuidelinesController {
  constructor(private readonly guidelinesService: GuidelinesService) {}

  @Post()
  async create(@Body() createGuidelineDto: CreateGuidelineDto) {
    try {
      return await this.guidelinesService.create(createGuidelineDto);
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

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGuidelineDto: UpdateGuidelineDto,
  ) {
    try {
      return await this.guidelinesService.update(id, updateGuidelineDto);
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
