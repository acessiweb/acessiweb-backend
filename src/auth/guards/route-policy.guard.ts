import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUEST_TOKEN_PAYLOAD, ROUTE_POLICY_KEY } from '../auth.constants';
import { RoutePolicies } from '../enum/route-policies.enum';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { UNAUTHORIZED } from 'src/common/errors/errors-codes';

@Injectable()
export class RoutePolicyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const routePolicyRequired = this.reflector.get<RoutePolicies | undefined>(
      ROUTE_POLICY_KEY,
      context.getHandler(),
    );

    if (!routePolicyRequired) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tokenPayload = request[REQUEST_TOKEN_PAYLOAD];

    if (!tokenPayload) {
      throw new CustomException(
        `Rota requer permissão ${routePolicyRequired}. Usuário não logado.`,
        UNAUTHORIZED,
        [],
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!tokenPayload.routePolicies.includes(routePolicyRequired)) {
      throw new CustomException(
        `Usuário não tem permissão ${routePolicyRequired}`,
        UNAUTHORIZED,
        [],
        HttpStatus.UNAUTHORIZED,
      );
    }

    return true;
  }
}
