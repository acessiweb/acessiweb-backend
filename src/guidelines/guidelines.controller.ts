import { Body, Controller, Post } from '@nestjs/common';
import { CreateGuidelineDto } from './dto/create-guideline.dto';
import { GuidelinesService } from './guidelines.service';
import CustomException from 'src/exceptions/custom-exception.exception';
import { CustomHttpException } from 'src/exceptions/custom-http.exception';

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
}
