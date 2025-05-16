import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { NOT_SIGN_IN } from 'src/common/errors/errors-codes';
import { REQUEST_TOKEN_PAYLOAD } from '../auth.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from '../entities/auth.entity';
import { Repository } from 'typeorm';
import { JwtHelpers } from '../helpers/auth-jwt.helper';

@Injectable()
export class AuthTokenGuard implements CanActivate {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private readonly jwtHelpers: JwtHelpers,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new CustomException(
        'Usuário não logado',
        NOT_SIGN_IN,
        [],
        HttpStatus.UNAUTHORIZED,
      );
    }

    const { jwtVerify } = await this.jwtHelpers.isAuthorized(
      token,
      this.authRepository,
    );

    request[REQUEST_TOKEN_PAYLOAD] = jwtVerify;

    return true;
  }

  extractTokenFromHeader(request: Request): string {
    const authorization = request.headers?.authorization;

    if (!authorization || typeof authorization !== 'string') {
      return;
    }

    return authorization.split(' ')[1];
  }
}
