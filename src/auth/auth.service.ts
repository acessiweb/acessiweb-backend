import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingService } from './hashing/hashing.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Auth } from './entities/auth.entity';
import { CryptoService } from 'src/common/encription/crypto.service';
import { CommonUser } from 'src/common-users/entities/common-user.entity';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { findByEmail, findByMobilePhone } from './helpers/auth-query.helper';
import {
  throwEmailOrMobilePhoneEmpty,
  throwInvalidLogin,
  throwPasswordsMismatch,
} from './helpers/auth-errors.helper';
import { JwtHelpers } from './helpers/auth-jwt.helper';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private readonly cryptoService: CryptoService,
    private readonly jwtHelpers: JwtHelpers,
  ) {}

  async login(loginDto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const field = loginDto.email ? 'email' : 'mobilePhone';
    const fieldTranslate = loginDto.email ? 'email' : 'número de celular';

    const { auth } = loginDto.email
      ? await findByEmail(
          loginDto.email,
          this.cryptoService,
          this.authRepository,
        )
      : await findByMobilePhone(
          loginDto.mobilePhone,
          this.cryptoService,
          this.authRepository,
        );

    const isPasswordValid = await this.hashingService.compare(
      loginDto.password,
      auth.password.toString(),
    );

    if (!auth || !isPasswordValid) {
      throwInvalidLogin(field, fieldTranslate);
    }

    return this.jwtHelpers.createTokens(auth, field);
  }

  logout() {}

  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { auth, jwtVerify } = await this.jwtHelpers.isAuthorized(
      refreshTokenDto.refreshToken,
      this.authRepository,
    );

    const fields = jwtVerify.email ? 'email' : 'mobilePhone';

    return this.jwtHelpers.createTokens(auth, fields);
  }

  async create(createAuthDto: CreateAuthDto, user: CommonUser): Promise<Auth> {
    if (!createAuthDto.email && !createAuthDto.mobilePhone) {
      throwEmailOrMobilePhoneEmpty();
    }

    if (createAuthDto.password !== createAuthDto.confirmPassword) {
      throwPasswordsMismatch(['password', 'confirmPassword']);
    }

    const auth = new Auth();

    if (createAuthDto.email) {
      const { emailHash } = await findByEmail(
        createAuthDto.email,
        this.cryptoService,
        this.authRepository,
      );

      auth.email = this.cryptoService.encrypt(createAuthDto.email);
      auth.emailHash = emailHash;
    }

    if (createAuthDto.mobilePhone) {
      const { mobilePhoneHash } = await findByMobilePhone(
        createAuthDto.mobilePhone,
        this.cryptoService,
        this.authRepository,
      );
      auth.mobilePhone = this.cryptoService.encrypt(createAuthDto.mobilePhone);
      auth.mobilePhoneHash = mobilePhoneHash;
    }

    auth.password = await this.hashingService.hash(createAuthDto.password);

    auth.user = user;

    return auth;
  }

  async recoverPass() {}

  async update(updateAuthDto: UpdateAuthDto) {}
}
