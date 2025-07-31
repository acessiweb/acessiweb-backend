import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { REQUEST_TOKEN_PAYLOAD } from '../auth.constants';
import { TokenPayloadDto } from '../dto/token-payload.dto';

interface AuthenticatedRequest extends Request {
  [REQUEST_TOKEN_PAYLOAD]: TokenPayloadDto;
}

export const TokenPayloadParam = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const context = ctx.switchToHttp();
    const request: AuthenticatedRequest = context.getRequest();
    return request[REQUEST_TOKEN_PAYLOAD];
  },
);
