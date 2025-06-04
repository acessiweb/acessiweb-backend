import { Test, TestingModule } from '@nestjs/testing';
import 'reflect-metadata';
import { CustomHttpException } from 'src/common/exceptions/custom-http.exception';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { AuthController } from './auth.controller';
import { authServiceMock } from 'test/__mocks__/auth.service.mock';
import { LoginDto } from './dto/login.dto';

describe('AuthController (unit)', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [authServiceMock],
      controllers: [AuthController],
    })
      .overrideGuard(AuthTokenGuard)
      .useValue({
        canActivate: jest.fn(() => true),
        extractTokenFromHeader: jest.fn(),
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  });

  describe('POST /auth/login', () => {
    // it('should return access and refresh tokens if successfully logged in', async () => {
    //   const loginDto = new LoginDto();
    //   loginDto.email = 'lau@mail.com';
    //   loginDto.password = 'Laura@testes1';
    //   const result = await controller.login(loginDto);
    //   expect(result).
    // });
  });
});
