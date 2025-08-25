import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
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

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('admin/login')
  loginAdmin(@Body() loginDto: LoginDto) {
    return this.authService.loginAdmin(loginDto);
  }

  @Post('refresh')
  refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @SetRoutePolicy(RoutePolicies.user)
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @Put('email')
  updateEmail(@Body() updateEmailDto: UpdateEmailDto) {
    return this.authService.updateEmail(updateEmailDto);
  }

  @SetRoutePolicy(RoutePolicies.user)
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @Put('mobile-phone')
  updateMobilePhone(@Body() updateMobilePhoneDto: UpdateMobilePhoneDto) {
    return this.authService.updateMobilePhone(updateMobilePhoneDto);
  }

  @SetRoutePolicy(RoutePolicies.user)
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @Put('password')
  updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @TokenPayloadParam() tokenPayloadDto: TokenPayloadDto,
  ) {
    return this.authService.updatePassword(tokenPayloadDto, updatePasswordDto);
  }
}
