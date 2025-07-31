import { Test, TestingModule } from '@nestjs/testing';
import { AuthTokenGuard } from './auth-token.guard';
import { Request } from 'express';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { ExecutionContext } from '@nestjs/common';
import { Auth } from '../entities/auth.entity';
import { AuthService } from '../auth.service';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import { REQUEST_TOKEN_PAYLOAD } from '../auth.constants';
import { UNAUTHORIZED } from 'src/common/constants/errors';

describe('AuthTokenGuard', () => {
  let authTokenGuard: AuthTokenGuard;
  let mockRequest: Request;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthTokenGuard,
        {
          provide: AuthService,
          useValue: {
            getTokenPayload: jest.fn(),
          },
        },
      ],
    }).compile();

    authTokenGuard = module.get<AuthTokenGuard>(AuthTokenGuard);
    authService = module.get<AuthService>(AuthService);

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

  describe('extractTokenFromHeader()', () => {
    it('should extract token if authorization header valid', () => {
      mockRequest.headers = {
        authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      };

      const result = authTokenGuard.extractTokenFromHeader(mockRequest);

      expect(result).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    });

    it('should return undefined when authorization header is missing', () => {
      const result = authTokenGuard.extractTokenFromHeader(mockRequest);
      expect(result).toBeUndefined();
    });

    it('should return undefined when authorization is empty string', () => {
      mockRequest.headers = {
        authorization: '',
      };

      const result = authTokenGuard.extractTokenFromHeader(mockRequest);

      expect(result).toBeUndefined();
    });

    it('should handle authorization header with only Bearer', () => {
      mockRequest.headers = {
        authorization: 'Bearer',
      };

      const result = authTokenGuard.extractTokenFromHeader(mockRequest);

      expect(result).toBeUndefined();
    });

    it('should handle authorization header without Bearer prefix', () => {
      mockRequest.headers = {
        authorization: 'just-a-token',
      };

      const result = authTokenGuard.extractTokenFromHeader(mockRequest);

      expect(result).toBeUndefined();
    });
  });

  describe('canActivate()', () => {
    it('should return true when token is valid', async () => {
      const mockToken = 'valid-jwt-token';
      const tokenPayload = {
        sub: '123',
        email: 'user@example.com',
        role: 'user',
        iat: 1234567890,
        exp: 1234567999,
      } as TokenPayloadDto;
      mockRequest.headers = { authorization: `Bearer ${mockToken}` };

      jest
        .spyOn(authService, 'getTokenPayload')
        .mockResolvedValue(tokenPayload);

      const result = await authTokenGuard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(authService.getTokenPayload).toHaveBeenCalledWith(mockToken);
      expect(mockRequest[REQUEST_TOKEN_PAYLOAD]).toEqual(tokenPayload);
    });

    it('should throw Custom Exception when token is missing', async () => {
      mockRequest.headers = {};

      try {
        await authTokenGuard.canActivate(mockExecutionContext);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe('Usuário não logado');
      }

      expect(authService.getTokenPayload).not.toHaveBeenCalled();
    });

    it('should throw Custom Exception when authorization header is malformed', async () => {
      mockRequest.headers = { authorization: 'InvalidFormat' };

      try {
        await authTokenGuard.canActivate(mockExecutionContext);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe('Usuário não logado');
      }

      expect(authService.getTokenPayload).not.toHaveBeenCalled();
    });

    it('should throw Custom Exception when token is empty string', async () => {
      mockRequest.headers = { authorization: 'Bearer ' };

      try {
        await authTokenGuard.canActivate(mockExecutionContext);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe('Usuário não logado');
      }

      expect(authService.getTokenPayload).not.toHaveBeenCalled();
    });

    it('should throw Custom Exception when unauthorized', async () => {
      const mockToken = 'invalid-jwt-token';

      mockRequest.headers = { authorization: `Bearer ${mockToken}` };

      jest
        .spyOn(authService, 'getTokenPayload')
        .mockRejectedValue(new CustomException('Não autorizado', UNAUTHORIZED));

      try {
        await authTokenGuard.canActivate(mockExecutionContext);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe('Não autorizado');
      }

      expect(authService.getTokenPayload).toHaveBeenCalledWith(mockToken);
      expect(mockRequest[REQUEST_TOKEN_PAYLOAD]).toBeUndefined();
    });
  });
});
