import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CommonUserService } from './common-users.service';
import { CreateCommonUserDto } from './dto/create-common-user.dto';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { throwHttpException } from 'src/common/errors/utils';
import { updateCommonUserDto } from './dto/update-common-user.dto';

@Controller('common-users')
export class CommonUserController {
  constructor(private readonly commonUsersService: CommonUserService) {}

  @Get(':cuid')
  async findOneBy(@Param('cuid', ParseUUIDPipe) cuid: string) {
    try {
      return await this.commonUsersService.findOneBy(cuid);
    } catch (e) {
      if (e instanceof CustomException) {
        throwHttpException(e);
      }
    }
  }

  @Post()
  async create(@Body() createCommonUserDto: CreateCommonUserDto) {
    try {
      return await this.commonUsersService.create(createCommonUserDto);
    } catch (e) {
      if (e instanceof CustomException) {
        throwHttpException(e);
      }
    }
  }

  @Put(':cuid')
  async update(
    @Param('cuid', ParseUUIDPipe) cuid: string,
    @Body() updateCommonUserDto: updateCommonUserDto,
  ) {
    try {
      return await this.commonUsersService.update(cuid, updateCommonUserDto);
    } catch (e) {
      if (e instanceof CustomException) {
        throwHttpException(e);
      }
    }
  }

  @Delete(':cuid')
  async delete(@Param('cuid', ParseUUIDPipe) cuid: string) {
    try {
      return await this.commonUsersService.delete(cuid);
    } catch (e) {}
  }
}
