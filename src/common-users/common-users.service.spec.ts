import { CommonUserService } from './common-users.service';
import { AuthService } from 'src/auth/auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { CommonUsersRepository } from './common-users.repository';
import { CreateCommonUserDto } from './dto/create-common-user.dto';
import { DataSource } from 'typeorm';
import { UpdateCommonUserDto } from './dto/update-common-user.dto';
import { CommonUser } from './entities/common-user.entity';
import {
  CREATION_OPERATION_FAILED,
  DELETE_OPERATION_FAILED,
  RESOURCE_NOT_FOUND,
  UPDATE_OPERATION_FAILED,
} from 'src/common/errors/errors-codes';

describe('CommonUsersService (unit)', () => {
  let service: CommonUserService;
  let repo: CommonUsersRepository;
  let authService: AuthService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommonUserService,
        {
          provide: CommonUsersRepository,
          useValue: {
            update: jest.fn(),
            delete: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            manager: {
              transaction: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CommonUserService>(CommonUserService);
    repo = module.get<CommonUsersRepository>(CommonUsersRepository);
    authService = module.get<AuthService>(AuthService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should return user id if user created', async () => {
      const commonUserId = 'common-user-id';
      const createCommonUserDto = new CreateCommonUserDto();
      createCommonUserDto.username = 'laura123';
      createCommonUserDto.password = 'Laura@testes1';
      createCommonUserDto.confirmPassword = 'Laura@testes1';
      createCommonUserDto.email = 'lau@mail.com';

      jest
        .spyOn(dataSource.manager, 'transaction')
        .mockImplementation(async (callback: any) => {
          const mockManager = {
            save: jest
              .fn()
              .mockImplementationOnce((user) => {
                user.id = commonUserId;
                return Promise.resolve(user);
              })
              .mockImplementationOnce((auth) => {
                return Promise.resolve(auth);
              }),
          };

          return await callback(mockManager);
        });

      const response = await service.create(createCommonUserDto);
      expect(authService.create).toHaveBeenCalled();
      expect(response).toEqual({ id: commonUserId });
    });

    it('should not call authService.create if user not created', async () => {
      const createCommonUserDto = new CreateCommonUserDto();
      createCommonUserDto.username = 'laura123';
      createCommonUserDto.password = 'Laura@testes1';
      createCommonUserDto.confirmPassword = 'Laura@testes1';

      jest
        .spyOn(dataSource.manager, 'transaction')
        .mockImplementation(async (callback: any) => {
          const mockManager = {
            save: jest
              .fn()
              .mockImplementationOnce(() => {
                return Promise.reject(
                  new CustomException(
                    `Ocorreu um erro`,
                    CREATION_OPERATION_FAILED,
                  ),
                );
              })
              .mockImplementationOnce((auth) => {
                return Promise.resolve(auth);
              }),
          };

          return await callback(mockManager);
        });

      await expect(service.create(createCommonUserDto)).rejects.toBeInstanceOf(
        CustomException,
      );
      expect(authService.create).not.toHaveBeenCalled();
    });

    it('should throw generic error if not custom exception', async () => {
      const createCommonUserDto = new CreateCommonUserDto();
      createCommonUserDto.username = 'laura123';
      createCommonUserDto.password = 'Laura@testes1';
      createCommonUserDto.confirmPassword = 'Laura@testes1';

      jest
        .spyOn(dataSource.manager, 'transaction')
        .mockImplementation(async (callback: any) => {
          const mockManager = {
            save: jest
              .fn()
              .mockImplementationOnce(() => {
                return Promise.reject(new Error(`Ocorreu um erro`));
              })
              .mockImplementationOnce((auth) => {
                return Promise.resolve(auth);
              }),
          };

          return await callback(mockManager);
        });

      await expect(service.create(createCommonUserDto)).rejects.toBeInstanceOf(
        CustomException,
      );
    });
  });

  describe('update()', () => {
    it('should return user updated if updated successfully', async () => {
      const userId = 'user-id';
      const updateCommonUserDto = new UpdateCommonUserDto();
      updateCommonUserDto.username = 'laura123';

      const mockResult = {
        id: userId,
        username: 'laura',
      } as CommonUser;

      jest.spyOn(service, 'findOneBy').mockResolvedValue(mockResult);

      jest.spyOn(repo, 'update').mockResolvedValue({
        id: userId,
        username: updateCommonUserDto.username,
      });

      const response = await service.update(userId, updateCommonUserDto);

      expect(service.findOneBy).toHaveBeenCalled();
      expect(response).toEqual({
        id: userId,
        username: updateCommonUserDto.username,
      });
    });

    it('should throw Custom Exception if not able to update user', async () => {
      const userId = 'user-id';
      const updateCommonUserDto = new UpdateCommonUserDto();
      updateCommonUserDto.username = 'laura123';

      const mockResult = {
        id: userId,
        username: 'laura',
      } as CommonUser;

      jest.spyOn(service, 'findOneBy').mockResolvedValue(mockResult);

      jest
        .spyOn(repo, 'update')
        .mockRejectedValue(new Error('Aconteceu um erro'));

      try {
        await service.update(userId, updateCommonUserDto);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(
          `Não foi possível atualizar usuário id ${userId}`,
        );
        expect(e.errorCode).toBe(UPDATE_OPERATION_FAILED);
      }

      expect(service.findOneBy).toHaveBeenCalled();
    });
  });

  describe('delete()', () => {
    it('should return user id if deleted succesfully', async () => {
      const userId = 'user-id';

      const mockResult = {
        id: userId,
        username: 'laura',
      } as CommonUser;

      jest.spyOn(service, 'findOneBy').mockResolvedValue(mockResult);

      jest.spyOn(repo, 'delete').mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });

      const response = await service.delete(userId);

      expect(service.findOneBy).toHaveBeenCalled();
      expect(response).toEqual({
        id: userId,
      });
    });

    it('should throw Custom Exception if failed deletion', async () => {
      const userId = 'user-id';

      const mockResult = {
        id: userId,
        username: 'laura',
      } as CommonUser;

      jest.spyOn(service, 'findOneBy').mockResolvedValue(mockResult);

      jest.spyOn(repo, 'delete').mockResolvedValue({
        affected: 0,
        raw: {},
        generatedMaps: [],
      });

      try {
        await service.delete(userId);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(`Não foi possível deletar usuário id ${userId}`);
        expect(e.errorCode).toBe(DELETE_OPERATION_FAILED);
      }

      expect(service.findOneBy).toHaveBeenCalled();
    });
  });

  describe('findOne()', () => {
    it('should return user if found', async () => {
      const userId = 'user-id';
      const mockResult = {
        id: userId,
        username: 'laura123',
      } as CommonUser;

      jest.spyOn(repo, 'findOneBy').mockResolvedValue(mockResult);

      const response = await service.findOneBy(userId);

      expect(response).toEqual(mockResult);
    });

    it('should throw Custom Exception if user not found', async () => {
      const userId = 'user-id';
      const errorMsg = `Usuário com id ${userId} não encontrado`;

      jest
        .spyOn(repo, 'findOneBy')
        .mockRejectedValue(new CustomException(errorMsg, RESOURCE_NOT_FOUND));

      try {
        await service.findOneBy(userId);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(errorMsg);
        expect(e.errorCode).toBe(RESOURCE_NOT_FOUND);
      }
    });
  });
});
