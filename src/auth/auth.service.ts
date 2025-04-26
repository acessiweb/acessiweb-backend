import { HttpStatus, Injectable } from '@nestjs/common';
// import { LoginDto } from './dto/login.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingService } from './hashing/hashing.service';
// import jwtConfig from './config/jwt.config';
// import { ConfigType } from '@nestjs/config';
// import { JwtService } from '@nestjs/jwt';
// import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Auth } from './entities/auth.entity';
import { CryptoService } from 'src/common/encription/crypto.service';
import { CustomHttpException } from 'src/exceptions/custom-http.exception';
import { CommonUserService } from 'src/common-users/common-users.service';
import CustomException from 'src/exceptions/custom-exception.exception';
import { CommonUser } from 'src/common-users/entities/common-user.entity';
import { DATA_NOT_MATCH, REQUIRED_FIELD } from 'src/common/errors/errors-codes';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    // @Inject(jwtConfig.KEY)
    // private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    // private readonly jwtService: JwtService,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private readonly cryptoService: CryptoService,
  ) {}

  // async login(loginDto: LoginDto) {
  //   const pessoa = await this.pessoaRepository.findOneBy({
  //     email: loginDto.email,
  //     active: true,
  //   });

  //   if (!pessoa) {
  //     throw new UnauthorizedException('Pessoa não autorizada');
  //   }

  //   const passwordIsValid = await this.hashingService.compare(
  //     loginDto.password,
  //     pessoa.passwordHash,
  //   );

  //   if (!passwordIsValid) {
  //     throw new UnauthorizedException('Senha inválida!');
  //   }

  //   return this.createTokens(pessoa);
  // }

  // private async createTokens(commonUser: CommonUser) {
  //   const accessTokenPromise = this.signJwtAsync<Partial<CommonUser>>(
  //     commonUser.id,
  //     this.jwtConfiguration.jwtTtl,
  //     { email: commonUser.email },
  //   );

  //   const refreshTokenPromise = this.signJwtAsync(
  //     commonUser.id,
  //     this.jwtConfiguration.jwtRefreshTtl,
  //   );

  //   const [accessToken, refreshToken] = await Promise.all([
  //     accessTokenPromise,
  //     refreshTokenPromise,
  //   ]);

  //   return {
  //     accessToken,
  //     refreshToken,
  //   };
  // }

  // private async signJwtAsync<T>(sub: number, expiresIn: number, payload?: T) {
  //   return await this.jwtService.signAsync(
  //     {
  //       sub,
  //       ...payload,
  //     },
  //     {
  //       audience: this.jwtConfiguration.audience,
  //       issuer: this.jwtConfiguration.issuer,
  //       secret: this.jwtConfiguration.secret,
  //       expiresIn,
  //     },
  //   );
  // }

  // async refreshTokens(refreshTokenDto: RefreshTokenDto) {
  //   try {
  //     const { sub } = await this.jwtService.verifyAsync(
  //       refreshTokenDto.refreshToken,
  //       this.jwtConfiguration,
  //     );

  //     const pessoa = await this.pessoaRepository.findOneBy({
  //       id: sub,
  //       active: true,
  //     });

  //     if (!pessoa) {
  //       throw new Error('Pessoa não autorizada');
  //     }

  //     return this.createTokens(pessoa);
  //   } catch (error) {
  //     throw new UnauthorizedException(error.message);
  //   }
  // }

  async create(createAuthDto: CreateAuthDto, user: CommonUser) {
    if (!createAuthDto.email && !createAuthDto.mobilePhone) {
      throw new CustomException(
        'Email ou número de celular precisa ser informado',
        REQUIRED_FIELD,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (createAuthDto.password !== createAuthDto.confirmPassword) {
      throw new CustomException(
        'As senhas não conferem',
        DATA_NOT_MATCH,
        HttpStatus.CONFLICT,
      );
    }

    const auth = new Auth();

    if (createAuthDto.email) {
      auth.email = this.cryptoService.encrypt(createAuthDto.email);
      auth.emailHash = this.cryptoService.toHash(createAuthDto.email);
    }

    if (createAuthDto.mobilePhone) {
      auth.mobilePhone = this.cryptoService.encrypt(createAuthDto.mobilePhone);
      auth.mobilePhoneHash = this.cryptoService.toHash(
        createAuthDto.mobilePhone,
      );
    }

    auth.password = await this.hashingService.hash(createAuthDto.password);

    auth.user = user;

    return await this.authRepository.save(auth);
  }
}
