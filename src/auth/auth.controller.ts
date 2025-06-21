import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { throwHttpException } from 'src/common/errors/utils';
import { UpdateEmailDto } from './dto/update-email.dto';
import { TokenPayloadDto } from './dto/token-payload.dto';
import { TokenPayloadParam } from './params/token-payload.param';
import { AuthTokenGuard } from './guards/auth-token.guard';
import { SetRoutePolicy } from './decorators/set-route-policy.decorator';
import { RoutePolicies } from './enum/route-policies.enum';
import { RoutePolicyGuard } from './guards/route-policy.guard';
import { UpdateMobilePhoneDto } from './dto/update-phone.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('lookup')
  async lookup(
    @Query('email') email?: string,
    @Query('mobilePhone') mobilePhone?: string,
  ) {
    const auth = await this.authService.findOne({
      email: email,
      mobilePhone: mobilePhone,
    });

    if (auth) {
      return {
        id: auth.user.id,
        role: auth.user.role,
      };
    }

    return null;
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      return this.authService.refreshTokens(refreshTokenDto);
    } catch (e) {
      if (e instanceof CustomException) {
        throwHttpException(e);
      }
    }
  }

  @SetRoutePolicy(RoutePolicies.user)
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @Put('email')
  updateEmail(@Body() updateEmailDto: UpdateEmailDto) {
    try {
      return this.authService.updateEmail(updateEmailDto);
    } catch (e) {
      if (e instanceof CustomException) {
        throwHttpException(e);
      }
    }
  }

  @SetRoutePolicy(RoutePolicies.user)
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @Put('mobile-phone')
  updateMobilePhone(@Body() updateMobilePhoneDto: UpdateMobilePhoneDto) {
    try {
      return this.authService.updateMobilePhone(updateMobilePhoneDto);
    } catch (e) {
      if (e instanceof CustomException) {
        throwHttpException(e);
      }
    }
  }

  @SetRoutePolicy(RoutePolicies.user)
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @Put('password')
  updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @TokenPayloadParam() tokenPayloadDto: TokenPayloadDto,
  ) {
    try {
      return this.authService.updatePassword(
        tokenPayloadDto,
        updatePasswordDto,
      );
    } catch (e) {
      if (e instanceof CustomException) {
        throwHttpException(e);
      }
    }
  }
}
