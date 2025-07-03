import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UNAUTHORIZED } from 'src/common/errors/errors-codes';
import CustomException from 'src/common/exceptions/custom-exception.exception';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    if (
      !request.headers.authorization ||
      typeof request.headers.authorization !== 'string'
    ) {
      throw new CustomException(
        'Credenciais Basic Auth ausentes ou inválidas',
        UNAUTHORIZED,
        [],
        HttpStatus.UNAUTHORIZED,
      );
    }

    const [authType, credentialsBase64] =
      request.headers.authorization.split(' ');

    if (authType !== 'Basic' || !credentialsBase64) {
      throw new CustomException(
        'Formato de autenticação Basic Auth inválido',
        UNAUTHORIZED,
        [],
        HttpStatus.UNAUTHORIZED,
      );
    }

    const credentialsDecoded = Buffer.from(
      credentialsBase64,
      'base64',
    ).toString('utf8');
    const [username, password] = credentialsDecoded.split(':');

    if (!username || !password) {
      throw new CustomException(
        'Usuário ou senha ausentes nas credenciais',
        UNAUTHORIZED,
        [],
        HttpStatus.UNAUTHORIZED,
      );
    }

    const expectedUsername = this.configService.get<string>(
      'BASIC_AUTH_USERNAME',
    );
    const expectedPassword = this.configService.get<string>(
      'BASIC_AUTH_PASSWORD',
    );

    const isUsernameValid = username === expectedUsername;
    const isPasswordValid = password === expectedPassword;

    if (!isUsernameValid || !isPasswordValid) {
      throw new CustomException(
        'Credenciais de autenticação inválidas',
        UNAUTHORIZED,
        [],
        HttpStatus.UNAUTHORIZED,
      );
    }

    return true;
  }
}
