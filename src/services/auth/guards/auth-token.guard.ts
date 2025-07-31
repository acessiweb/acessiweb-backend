import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { NOT_SIGN_IN } from 'src/common/constants/errors';
import { REQUEST_TOKEN_PAYLOAD } from '../auth.constants';
import { AuthService } from '../auth.service';
import { TokenPayloadDto } from '../dto/token-payload.dto';

interface AuthenticatedRequest extends Request {
  [REQUEST_TOKEN_PAYLOAD]: TokenPayloadDto;
}

@Injectable()
export class AuthTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new CustomException(
        'Usuário não logado',
        NOT_SIGN_IN,
        [],
        HttpStatus.UNAUTHORIZED,
      );
    }

    const tokenPayload = await this.authService.getTokenPayload(token);

    request[REQUEST_TOKEN_PAYLOAD] = tokenPayload;

    return true;
  }

  extractTokenFromHeader(request: Request): string | undefined {
    const authorization = request.headers?.authorization;

    if (!authorization || typeof authorization !== 'string') {
      return undefined;
    }

    const parts = authorization.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return undefined;
    }

    return parts[1];
  }
}
