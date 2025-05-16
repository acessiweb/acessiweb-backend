import { Global, Module } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Auth } from './entities/auth.entity';
import { CryptoService } from 'src/common/encription/crypto.service';
import jwtConfig from './config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { JwtHelpers } from './helpers/auth-jwt.helper';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Auth]),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    AuthService,
    CryptoService,
    JwtHelpers,
  ],
  exports: [
    HashingService,
    AuthService,
    TypeOrmModule,
    JwtModule,
    ConfigModule,
    JwtHelpers,
  ],
})
export class AuthModule {}
