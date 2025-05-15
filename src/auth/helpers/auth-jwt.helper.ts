import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { Auth } from '../entities/auth.entity';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { UNAUTHORIZED } from 'src/common/errors/errors-codes';
import { findByEmail, findByMobilePhone } from './auth-query.helper';
import { CryptoService } from 'src/common/encription/crypto.service';

@Injectable()
export class JwtHelpers {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
  ) {}

  async signJwtAsync<T>(sub: string, payload?: T): Promise<string> {
    return await this.jwtService.signAsync(
      {
        sub,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn: this.jwtConfiguration.jwtTtl,
      },
    );
  }

  async createTokens(
    auth: Auth,
    field: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    let jwtPayload = {};

    field === 'email'
      ? (jwtPayload['email'] = auth.email)
      : (jwtPayload['mobilePhone'] = auth.mobilePhone);

    const accessTokenPromise = await this.signJwtAsync<Partial<Auth>>(
      auth.user.id,
      jwtPayload,
    );

    const refreshTokenPromise = this.signJwtAsync(auth.user.id);

    const [accessToken, refreshToken] = await Promise.all([
      accessTokenPromise,
      refreshTokenPromise,
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async isAuthorized(
    refreshToken: string,
    authRepository: Repository<Auth>,
  ): Promise<{ auth: Auth; jwtVerify: any }> {
    const jwtVerify = await this.jwtService.verifyAsync(
      refreshToken,
      this.jwtConfiguration,
    );

    const auth = jwtVerify.email
      ? await findByEmail(jwtVerify.email, this.cryptoService, authRepository)
      : await findByMobilePhone(
          jwtVerify.mobilePhone,
          this.cryptoService,
          authRepository,
        );

    if (!auth.auth) {
      throw new CustomException(
        'Não autorizado',
        UNAUTHORIZED,
        [],
        HttpStatus.UNAUTHORIZED,
      );
    }

    return { auth: auth.auth, jwtVerify };
  }
}
