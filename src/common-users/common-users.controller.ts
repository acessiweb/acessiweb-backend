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
import { CommonUserService } from './common-users.service';
import { CreateCommonUserDto } from './dto/create-common-user.dto';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { throwHttpException } from 'src/common/errors/utils';
import { UpdateCommonUserDto } from './dto/update-common-user.dto';
import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';
import { RoutePolicies } from 'src/auth/enum/route-policies.enum';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { RoutePolicyGuard } from 'src/auth/guards/route-policy.guard';

@Controller('common-users')
export class CommonUserController {
  constructor(private readonly commonUsersService: CommonUserService) {}

  @SetRoutePolicy(RoutePolicies.user)
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
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

  @SetRoutePolicy(RoutePolicies.user)
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @Put(':cuid')
  async update(
    @Param('cuid', ParseUUIDPipe) cuid: string,
    @Body() updateCommonUserDto: UpdateCommonUserDto,
  ) {
    try {
      return await this.commonUsersService.update(cuid, updateCommonUserDto);
    } catch (e) {
      if (e instanceof CustomException) {
        throwHttpException(e);
      }
    }
  }

  @SetRoutePolicy(RoutePolicies.user)
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @Delete(':cuid')
  async delete(@Param('cuid', ParseUUIDPipe) cuid: string) {
    try {
      return await this.commonUsersService.delete(cuid);
    } catch (e) {
      if (e instanceof CustomException) {
        throwHttpException(e);
      }
    }
  }
}
