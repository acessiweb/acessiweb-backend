import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingService } from './hashing/hashing.service';
import jwtConfig from './config/jwt.config';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Auth } from './entities/auth.entity';
import { CryptoService } from 'src/common/encription/crypto.service';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import {
  DATA_NOT_MATCH,
  DUPLICATE_DATA,
  INVALID_DATA,
  REQUIRED_FIELD,
  UNAUTHORIZED,
} from 'src/common/errors/errors-codes';
import { ConfigType } from '@nestjs/config';
import { CommonUser } from 'src/common-users/entities/common-user.entity';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private readonly cryptoService: CryptoService,
  ) {}

  throwEmailOrMobilePhoneEmpty() {
    throw new CustomException(
      'Email ou número de celular precisa ser informado',
      REQUIRED_FIELD,
      ['email', 'mobilePhone'],
      HttpStatus.BAD_REQUEST,
    );
  }

  async isAuthorized(
    refreshToken: string,
  ): Promise<{ auth: Auth; jwtVerify: any }> {
    const jwtVerify = await this.jwtService.verifyAsync(
      refreshToken,
      this.jwtConfiguration,
    );

    const auth = await this.findOneBy({
      email: jwtVerify.email,
      mobilePhone: jwtVerify.mobilePhone,
    });

    if (!auth) {
      throw new CustomException(
        'Não autorizado',
        UNAUTHORIZED,
        [],
        HttpStatus.UNAUTHORIZED,
      );
    }

    return { auth, jwtVerify };
  }

  async findDuplicate(field: 'email' | 'mobilePhone'): Promise<string> {
    const hash = this.cryptoService.toHash(field);

    const fieldTranslate = field === 'email' ? 'email' : 'número de celular';

    const findOneBy = {};

    if (field === 'email') {
      findOneBy['emailHash'] = hash;
    }

    if (field === 'mobilePhone') {
      findOneBy['mobilePhoneHash'] = hash;
    }

    const alreadyExists = await this.authRepository.findOneBy(findOneBy);

    if (alreadyExists) {
      throw new CustomException(
        `Esse ${fieldTranslate} já está sendo utilizado`,
        DUPLICATE_DATA,
        [field],
        HttpStatus.CONFLICT,
      );
    }

    return hash;
  }

  async findOneBy(params: {
    email: string;
    mobilePhone: string;
  }): Promise<Auth> {
    if (!params.email && !params.mobilePhone) {
      this.throwEmailOrMobilePhoneEmpty();
    }

    const findOneBy = {
      active: true,
    };

    if (params.email) {
      findOneBy['email'] = params.email;
    }

    if (params.mobilePhone) {
      findOneBy['mobilePhone'] = params.mobilePhone;
    }

    return await this.authRepository.findOneBy(findOneBy);
  }

  async login(loginDto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const auth = await this.findOneBy({
      email: loginDto.email,
      mobilePhone: loginDto.mobilePhone,
    });

    const fieldTranslate = loginDto.email ? 'email' : 'número de celular';

    const fields = loginDto.email ? 'email' : 'mobilePhone';

    const isPasswordValid = await this.hashingService.compare(
      loginDto.password,
      auth.password,
    );

    if (!auth || !isPasswordValid) {
      throw new CustomException(
        `${fieldTranslate} ou senha inválidos`,
        INVALID_DATA,
        [fields, 'password'],
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.createTokens(auth, fields);
  }

  logout() {}

  private async createTokens(
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

    const accessTokenPromise = this.signJwtAsync<Partial<Auth>>(
      auth.user.id,
      this.jwtConfiguration.jwtTtl,
      jwtPayload,
    );

    const refreshTokenPromise = this.signJwtAsync(
      auth.user.id,
      this.jwtConfiguration.jwtRefreshTtl,
    );

    const [accessToken, refreshToken] = await Promise.all([
      accessTokenPromise,
      refreshTokenPromise,
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async signJwtAsync<T>(
    sub: string,
    expiresIn: number,
    payload?: T,
  ): Promise<string> {
    return await this.jwtService.signAsync(
      {
        sub,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { auth, jwtVerify } = await this.isAuthorized(
      refreshTokenDto.refreshToken,
    );

    const fields = jwtVerify.email ? 'email' : 'mobilePhone';

    return this.createTokens(auth, fields);
  }

  async create(createAuthDto: CreateAuthDto, user: CommonUser): Promise<Auth> {
    if (!createAuthDto.email && !createAuthDto.mobilePhone) {
      this.throwEmailOrMobilePhoneEmpty();
    }

    if (createAuthDto.password !== createAuthDto.confirmPassword) {
      throw new CustomException(
        'As senhas não conferem',
        DATA_NOT_MATCH,
        ['password', 'confirmPassword'],
        HttpStatus.CONFLICT,
      );
    }

    const auth = new Auth();

    if (createAuthDto.email) {
      const emailHash = await this.findDuplicate('email');
      auth.email = this.cryptoService.encrypt(createAuthDto.email);
      auth.emailHash = emailHash;
    }

    if (createAuthDto.mobilePhone) {
      const mobilePhoneHash = await this.findDuplicate('mobilePhone');
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
