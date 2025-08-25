import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingService } from './hashing/hashing.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Auth } from './entities/auth.entity';
import jwtConfig from './config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenPayloadDto } from './dto/token-payload.dto';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import {
  DATA_NOT_MATCH,
  INVALID_DATA,
  REQUIRED_FIELD,
  UNAUTHORIZED,
  UPDATE_OPERATION_FAILED,
} from 'src/common/constants/errors';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdateMobilePhoneDto } from './dto/update-phone.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { AdminUser } from 'src/domains/users/admin-users/entities/admin-user.entity';

import { CommonUser } from 'src/domains/users/common-users/entities/common-user.entity';
import { CryptoService } from '../crypto/crypto.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private readonly cryptoService: CryptoService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
  ) {}

  async findOne(where: {
    email?: string;
    mobilePhone?: string;
    userId?: string;
  }): Promise<Auth | undefined | null> {
    const qb = this.authRepository
      .createQueryBuilder('auth')
      .leftJoinAndSelect('auth.user', 'user');

    if (where.email) {
      qb.where('auth.emailHash = :emailHash', {
        emailHash: this.cryptoService.toHash(where.email),
      });
    }

    if (where.mobilePhone) {
      qb.where('auth.mobilePhone = :mobilePhoneHash', {
        mobilePhoneHash: this.cryptoService.toHash(where.mobilePhone),
      });
    }

    if (where.userId) {
      qb.where('auth.user = :user', { user: where.userId });
    }

    try {
      const auth = await qb.getOne();
      return auth;
    } catch (e) {
      return;
    }
  }

  throwEmailOrMobilePhoneEmpty() {
    throw new CustomException(
      'Email ou número de celular precisa ser informado',
      REQUIRED_FIELD,
      ['email', 'mobilePhone'],
      HttpStatus.BAD_REQUEST,
    );
  }

  throwPasswordsMismatch(fields: string[]) {
    throw new CustomException(
      'As senhas não conferem',
      DATA_NOT_MATCH,
      [...fields],
      HttpStatus.CONFLICT,
    );
  }

  async login(loginDto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const field = loginDto.email ? 'email' : 'mobilePhone';
    const fieldTranslate = loginDto.email ? 'email' : 'número de celular';

    const auth = await this.findOne({
      email: loginDto.email,
      mobilePhone: loginDto.mobilePhone,
    });

    if (auth?.user.role === 'admin') {
      throw new CustomException(
        'Usuário não autorizado',
        UNAUTHORIZED,
        [],
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordValid = await this.hashingService.compare(
      loginDto.password,
      auth ? auth.password.toString() : '',
    );

    if (!auth || !isPasswordValid) {
      throw new CustomException(
        `${fieldTranslate} ou senha inválidos`,
        INVALID_DATA,
        [field, 'password'],
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.createTokens(auth);
  }

  async loginAdmin(loginDto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const field = loginDto.email ? 'email' : 'mobilePhone';
    const fieldTranslate = loginDto.email ? 'email' : 'número de celular';

    const auth = await this.findOne({
      email: loginDto.email,
      mobilePhone: loginDto.mobilePhone,
    });

    if (auth?.user.role === 'user') {
      throw new CustomException(
        'Usuário não autorizado',
        UNAUTHORIZED,
        [],
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordValid = await this.hashingService.compare(
      loginDto.password,
      auth ? auth.password.toString() : '',
    );

    if (!auth || !isPasswordValid) {
      throw new CustomException(
        `${fieldTranslate} ou senha inválidos`,
        INVALID_DATA,
        [field, 'password'],
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.createTokens(auth);
  }

  logout() {}

  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const tokenPayload = await this.getTokenPayload(
      refreshTokenDto.refreshToken,
    );

    const auth = await this.findOne({
      userId: tokenPayload.sub,
    });

    if (!auth) {
      throw new CustomException(
        'Não foi possível gerar os tokens',
        UNAUTHORIZED,
        [],
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.createTokens(auth);
  }

  async create(
    createAuthDto: CreateAuthDto,
    user: CommonUser | AdminUser,
  ): Promise<Auth> {
    if (!createAuthDto.email && !createAuthDto.mobilePhone) {
      this.throwEmailOrMobilePhoneEmpty();
    }

    if (
      createAuthDto.password &&
      createAuthDto.confirmPassword &&
      createAuthDto.password !== createAuthDto.confirmPassword
    ) {
      this.throwPasswordsMismatch(['password', 'confirmPassword']);
    }

    const auth = new Auth();

    if (createAuthDto.email) {
      const emailHash = this.cryptoService.toHash(createAuthDto.email);
      auth.email = this.cryptoService.encrypt(createAuthDto.email);
      auth.emailHash = emailHash;
    }

    if (createAuthDto.mobilePhone) {
      const mobilePhoneHash = this.cryptoService.toHash(
        createAuthDto.mobilePhone,
      );
      auth.mobilePhone = this.cryptoService.encrypt(createAuthDto.mobilePhone);
      auth.mobilePhoneHash = mobilePhoneHash;
    }

    if (createAuthDto.password) {
      auth.password = await this.hashingService.hash(createAuthDto.password);
    }

    auth.user = user;

    return auth;
  }

  async recoverPass() {}

  async updateEmail(
    updateEmailDto: UpdateEmailDto,
  ): Promise<{ email: string }> {
    const auth = await this.findOne({ email: updateEmailDto.email });

    if (!auth) {
      throw new CustomException(
        'Não foi possível atualizar o email',
        UNAUTHORIZED,
        [],
        HttpStatus.UNAUTHORIZED,
      );
    }

    const emailHash = this.cryptoService.toHash(updateEmailDto.email!);
    const emailEncrypt = this.cryptoService.encrypt(updateEmailDto.email!);

    const emailUpdated = await this.authRepository
      .createQueryBuilder()
      .update(Auth)
      .set({
        email: emailEncrypt,
        emailHash,
      })
      .where('id = :id', { id: auth.id })
      .returning(['email'])
      .execute();

    if (emailUpdated.affected && emailUpdated.affected > 0) {
      const { email } = emailUpdated.raw[0];

      return {
        email: this.cryptoService.decrypt(email),
      };
    }

    throw new CustomException(
      `Não foi possível atualizar email`,
      UPDATE_OPERATION_FAILED,
      ['email'],
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async updateMobilePhone(updateMobilePhoneDto: UpdateMobilePhoneDto) {
    const auth = await this.findOne({
      mobilePhone: updateMobilePhoneDto.mobilePhone,
    });

    if (!auth) {
      throw new CustomException(
        'Não foi possível atualizar o celular',
        UNAUTHORIZED,
        [],
        HttpStatus.UNAUTHORIZED,
      );
    }

    const mobilePhoneHash = this.cryptoService.toHash(
      updateMobilePhoneDto.mobilePhone!,
    );
    const mobilePhoneEncrypt = this.cryptoService.encrypt(
      updateMobilePhoneDto.mobilePhone!,
    );

    const mobilePhoneUpdated = await this.authRepository
      .createQueryBuilder()
      .update(Auth)
      .set({
        email: mobilePhoneEncrypt,
        mobilePhoneHash,
      })
      .where('id = :id', { id: auth.id })
      .returning(['mobilePhone'])
      .execute();

    if (mobilePhoneUpdated.affected && mobilePhoneUpdated.affected > 0) {
      const { mobilePhone } = mobilePhoneUpdated.raw[0];

      return {
        mobilePhone: this.cryptoService.decrypt(mobilePhone),
      };
    }

    throw new CustomException(
      `Não foi possível atualizar celular`,
      UPDATE_OPERATION_FAILED,
      ['mobilePhone'],
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async updatePassword(
    tokenPayloadDto: TokenPayloadDto,
    updatePasswordDto: UpdatePasswordDto,
  ) {
    if (
      updatePasswordDto.newPassword !== updatePasswordDto.confirmNewPassword
    ) {
      this.throwPasswordsMismatch(['newPassword', 'confirmNewPassword']);
    }

    const auth = await this.findOne({
      email: tokenPayloadDto.email,
      mobilePhone: tokenPayloadDto.mobilePhone,
    });

    if (!auth) {
      throw new CustomException(
        'Não foi possível atualizar a senha',
        UNAUTHORIZED,
        [],
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordValid = await this.hashingService.compare(
      updatePasswordDto.oldPassword,
      auth.password,
    );

    if (!isPasswordValid) {
      throw new CustomException(
        'Senha inválida',
        INVALID_DATA,
        ['oldPassword'],
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await this.hashingService.hash(
      updatePasswordDto.newPassword,
    );

    const updated = await this.authRepository.update(auth.id, {
      password: hashedPassword,
    });

    if (updated.affected && updated.affected > 0) {
      return {
        success: true,
      };
    }

    throw new CustomException(
      `Não foi possível atualizar a senha`,
      UPDATE_OPERATION_FAILED,
      ['password'],
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async signJwtAsync(
    type: 'access' | 'refresh',
    sub: string,
    payload?: JwtPayload,
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
        expiresIn:
          type === 'access'
            ? this.jwtConfiguration.jwtTtl
            : this.jwtConfiguration.jwtRefreshTtl,
      },
    );
  }

  async getTokenPayload(token: string): Promise<TokenPayloadDto> {
    return await this.jwtService.verifyAsync<TokenPayloadDto>(
      token,
      this.jwtConfiguration,
    );
  }

  async createTokens(auth: Auth): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const jwtPayload = {} as JwtPayload;

    if (auth.email) jwtPayload.email = this.cryptoService.decrypt(auth.email);
    if (auth.mobilePhone)
      jwtPayload.mobilePhone = this.cryptoService.decrypt(auth.mobilePhone);

    jwtPayload.role = auth.user.role;

    if ('username' in auth.user && typeof auth.user.username == 'string') {
      jwtPayload.username = auth.user.username;
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.signJwtAsync('access', auth.user.id, jwtPayload),
      this.signJwtAsync('refresh', auth.user.id),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
