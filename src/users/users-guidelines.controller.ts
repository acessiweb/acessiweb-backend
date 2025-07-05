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
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { Filter, FilterParams } from 'src/common/params/filter';
import { Pagination, PaginationParams } from 'src/common/params/pagination';
import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';
import { RoutePolicies } from 'src/auth/enum/route-policies.enum';
import { RoutePolicyGuard } from 'src/auth/guards/route-policy.guard';
import { GuidelinesService } from 'src/guidelines/guidelines.service';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { CreateUserGuidelineDto } from './dto/create-user-guideline.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from 'src/common/pipes/file-validation.pipe';
import { UpdateUserGuidelineDto } from './dto/edit-user-guideline.dto';

@SetRoutePolicy(RoutePolicies.user)
@UseGuards(AuthTokenGuard, RoutePolicyGuard)
@Controller('users/:uid/guidelines')
export class UserGuidelinesController {
  constructor(private readonly guidelinesService: GuidelinesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Param('uid') uid: string,
    @UploadedFile(new FileValidationPipe()) image: Express.Multer.File,
    @Body() createUserGuidelineDto: CreateUserGuidelineDto,
  ) {
    return await this.guidelinesService.create(
      {
        ...createUserGuidelineDto,
        userId: uid,
      },
      image,
    );
  }

  @Put(':gid')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('gid') gid: string,
    @UploadedFile(new FileValidationPipe()) image: Express.Multer.File,
    @Body() updateUserGuidelineDto: UpdateUserGuidelineDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return await this.guidelinesService.update(
      gid,
      updateUserGuidelineDto,
      image,
      tokenPayload,
    );
  }

  @UseGuards(AuthTokenGuard)
  @Delete(':id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return await this.guidelinesService.delete(id, tokenPayload);
  }

  @Get(':gid')
  async findOne(@Param('gid') gid: string) {
    return await this.guidelinesService.findOne(gid);
  }

  @Get()
  async findAll(
    @Param('uid') uid: string,
    @Pagination() pagination: PaginationParams,
    @Filter() filters?: FilterParams,
  ) {
    return await this.guidelinesService.findAll({
      userId: uid,
      keyword: filters?.keyword,
      limit: pagination.limit,
      offset: pagination.offset,
      initialDate: filters?.initialDate,
      endDate: filters?.endDate,
      deficiences: filters?.deficiences,
      isDeleted: filters?.isDeleted,
      isRequest: true,
    });
  }
}
