import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { ExecutionContext } from '@nestjs/common';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import { REQUEST_TOKEN_PAYLOAD } from '../auth.constants';
import { RoutePolicyGuard } from './route-policy.guard';
import { Reflector } from '@nestjs/core';
import { RoutePolicies } from '../enum/route-policies.enum';
import CustomException from 'src/common/exceptions/custom-exception.exception';

describe('RoutePolicyGuard', () => {
  let routePolicyGuard: RoutePolicyGuard;
  let mockRequest: Request;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoutePolicyGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    routePolicyGuard = module.get<RoutePolicyGuard>(RoutePolicyGuard);
    reflector = module.get<Reflector>(Reflector);

    mockRequest = {
      headers: {},
    } as Request;

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue({}),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as jest.Mocked<ExecutionContext>;
  });

  afterEach(() => {
    mockRequest = {
      headers: {},
    } as Request;
  });

  describe('canActivate()', () => {
    it('should return true if route needs permission and user has it', async () => {
      const mockToken = 'valid-jwt-token';
      const tokenPayload = {
        sub: '123',
        email: 'user@example.com',
        role: 'user',
        iat: 1234567890,
        exp: 1234567999,
      } as TokenPayloadDto;
      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      mockRequest['REQUEST_TOKEN_PAYLOAD'] = tokenPayload;

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(RoutePolicies.user);

      const result = await routePolicyGuard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockRequest[REQUEST_TOKEN_PAYLOAD]).toEqual(tokenPayload);
    });

    it('should return true if no route policy defined', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const result = await routePolicyGuard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should throw Custom Exception if user does not have permissions needed', async () => {
      const mockToken = 'valid-jwt-token';
      const tokenPayload = {
        sub: '123',
        email: 'user@example.com',
        role: 'admin',
        iat: 1234567890,
        exp: 1234567999,
      } as TokenPayloadDto;
      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      mockRequest['REQUEST_TOKEN_PAYLOAD'] = tokenPayload;

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(RoutePolicies.user);

      try {
        await routePolicyGuard.canActivate(mockExecutionContext);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(
          `Usuário não tem permissão ${RoutePolicies.user}`,
        );
      }
    });
  });
});
