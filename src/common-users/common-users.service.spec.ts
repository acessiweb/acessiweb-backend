import { Repository } from 'typeorm';
import { CommonUserService } from './common-users.service';
import { CommonUser } from './entities/common-user.entity';
import { AuthService } from 'src/auth/auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { REQUIRED_FIELD } from 'src/common/errors/errors-codes';
import { HttpStatus } from '@nestjs/common';

describe('CommonUsersService (unit)', () => {
  let service: CommonUserService;
  let repo: Repository<CommonUser>;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommonUserService,
        {
          provide: getRepositoryToken(CommonUser),
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CommonUserService>(CommonUserService);
    repo = module.get<Repository<CommonUser>>(getRepositoryToken(CommonUser));
    authService = module.get<AuthService>(AuthService);
  });

  describe('create()', () => {
    it('should not call repo.save if auth not created', async () => {
      const dto = {
        username: 'laura',
        password: 'Laura@testes1',
        confirmPassword: 'Laura@testes1',
        email: '',
        mobilePhone: '',
      };

      jest
        .spyOn(authService, 'create')
        .mockRejectedValue(
          new CustomException(
            'Email ou número de celular precisa ser informado',
            REQUIRED_FIELD,
            ['email', 'mobilePhone'],
            HttpStatus.BAD_REQUEST,
          ),
        );

      await expect(service.create(dto)).rejects.toBeInstanceOf(CustomException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('should call authService.create with email, mobilePhone, password and confirmPassword, and user', async () => {
      const dto = {
        username: 'laura',
        password: 'Laura@testes1',
        confirmPassword: 'Laura@testes1',
        email: '',
        mobilePhone: '',
      };

      const { username, ...authData } = dto;

      await service.create(dto);

      const createAuthSpy = jest
        .spyOn(authService, 'create')
        .mockResolvedValue(undefined);

      const [[passedAuthData, passedUser]] = createAuthSpy.mock.calls;
      expect(passedAuthData).toEqual(authData);
      expect(passedUser).toBeInstanceOf(CommonUser);
    });

    it('should call commonUserRepository.save with user data', async () => {
      const dto = {
        username: 'laura',
        password: 'Laura@testes1',
        confirmPassword: 'Laura@testes1',
        email: 'lau@mail.com',
        mobilePhone: '',
      };

      await service.create(dto);

      const { username } = dto;

      expect(repo.save).toHaveBeenCalledWith({ username });
      expect(repo.save).toHaveBeenCalledWith(expect.any(CommonUser));
      expect(repo.save).not.toHaveBeenCalledWith(dto);
    });

    it('should return user id if user created', async () => {
      const dto = {
        username: 'laura',
        password: 'Laura@testes1',
        confirmPassword: 'Laura@testes1',
        email: 'lau@mail.com',
        mobilePhone: '',
      };

      await expect(service.create(dto)).resolves.toMatchObject({
        id: undefined,
      });
    });
  });
});
