import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GuidelinesService } from './guidelines.service';
import Pagination from 'src/common/decorators/pagination';
import Filter from 'src/common/decorators/filter';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from 'src/common/pipes/file-validation.pipe';
import { CreateGuidelineDto } from './dto/create-guideline.dto';
import { AuthTokenGuard } from 'src/services/auth/guards/auth-token.guard';
import { TokenPayloadDto } from 'src/services/auth/dto/token-payload.dto';
import { TokenPayloadParam } from 'src/services/auth/params/token-payload.param';
import { UpdateGuidelineDto } from './dto/update-guideline.dto';
import { PaginationParams } from 'src/types/pagination';
import { GuidelineFilter } from 'src/types/filter';

@Controller('guidelines')
export class GuidelinesController {
  constructor(private readonly guidelinesService: GuidelinesService) {}

  @UseGuards(AuthTokenGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile(new FileValidationPipe()) image: Express.Multer.File,
    @Body() createGuidelineDto: CreateGuidelineDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return await this.guidelinesService.create(
      tokenPayload.sub,
      createGuidelineDto,
      image,
    );
  }

  @UseGuards(AuthTokenGuard)
  @Put(':gid')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('gid') gid: string,
    @UploadedFile(new FileValidationPipe()) image: Express.Multer.File,
    @Body() updateGuidelineDto: UpdateGuidelineDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return await this.guidelinesService.update(
      gid,
      updateGuidelineDto,
      image,
      tokenPayload,
    );
  }

  @UseGuards(AuthTokenGuard)
  @Delete(':gid')
  async delete(
    @Param('gid', ParseUUIDPipe) gid: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return await this.guidelinesService.delete(gid, tokenPayload);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.guidelinesService.findOne(id);
  }

  @Get()
  async findAll(
    @Pagination() pagination: PaginationParams,
    @Filter() filters?: GuidelineFilter,
  ) {
    return await this.guidelinesService.findAll({
      keyword: filters?.keyword,
      limit: pagination.limit,
      offset: pagination.offset,
      initialDate: filters?.initialDate,
      endDate: filters?.endDate,
      deficiences: filters?.deficiences,
      isRequest: false,
      isDeleted: filters?.isDeleted,
      statusCode: 'APPROVED',
    });
  }
}
