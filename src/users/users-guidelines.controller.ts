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
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { throwHttpException } from 'src/common/errors/utils';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { Filter, FilterParams } from 'src/common/params/filter';
import { Pagination, PaginationParams } from 'src/common/params/pagination';
import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';
import { RoutePolicies } from 'src/auth/enum/route-policies.enum';
import { RoutePolicyGuard } from 'src/auth/guards/route-policy.guard';
import { GuidelinesService } from 'src/guidelines/guidelines.service';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { UpdateGuidelineDto } from 'src/guidelines/dto/update-guideline.dto';
import { UsersService } from './users.service';
import { CreateUserGuidelineDto } from './dto/create-user-guideline.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from 'src/common/pipes/file-validation.pipe';

@SetRoutePolicy(RoutePolicies.user)
@UseGuards(AuthTokenGuard, RoutePolicyGuard)
@Controller('users/:uid/guidelines')
export class UserGuidelinesController {
  constructor(
    private readonly userService: UsersService,
    private readonly guidelinesService: GuidelinesService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Param('uid') uid: string,
    @UploadedFile(new FileValidationPipe()) image: Express.Multer.File,
    @Body() createUserGuidelineDto: CreateUserGuidelineDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return await this.guidelinesService.create(
      {
        ...createUserGuidelineDto,
        userId: uid,
      },
      image,
      tokenPayload,
    );
  }

  @Put(':gid')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('uid') uid: string,
    @Param('gid') gid: string,
    @UploadedFile(new FileValidationPipe()) image: Express.Multer.File,
    @Body() updateGuidelineDto: UpdateGuidelineDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    try {
      return await this.guidelinesService.update(
        gid,
        updateGuidelineDto,
        image,
        tokenPayload,
      );
    } catch (e) {
      if (e instanceof CustomException) {
        throwHttpException(e);
      }
    }
  }

  @UseGuards(AuthTokenGuard)
  @Delete(':id')
  async delete(
    @Param('uid') uid: string,
    @Param('gid', ParseUUIDPipe) gid: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    try {
      return await this.guidelinesService.delete(gid, tokenPayload);
    } catch (e) {
      if (e instanceof CustomException) {
        throwHttpException(e);
      }
    }
  }

  @Get(':gid')
  async findOne(@Param('uid') uid: string, @Param('gid') gid: string) {
    try {
      return await this.guidelinesService.findOne(gid);
    } catch (e) {}
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
    });
  }
}
