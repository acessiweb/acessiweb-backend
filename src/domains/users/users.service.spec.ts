import { Test, TestingModule } from '@nestjs/testing';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { RESOURCE_NOT_FOUND } from 'src/common/constants/errors';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { usersMock } from 'test/__mocks__/users.service.mock';

describe('UsersService (unit)', () => {
  let service: UsersService;
  let repo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    repo = module.get<Repository<User>>(getRepositoryToken(User));
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  describe('findOneBy()', () => {
    it('should return user if found', async () => {
      const mockResult = { id: usersMock[0].id } as User;
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(mockResult);
      const user = await service.findOneBy(mockResult.id);
      expect(user).toStrictEqual(mockResult);
    });

    it('should throw an error if deficiency not found', async () => {
      const userId = 'dfsdfsafds';
      const exception = new CustomException(
        `Usuário com id ${userId} não encontrado`,
        RESOURCE_NOT_FOUND,
      );

      jest.spyOn(repo, 'findOneBy').mockRejectedValue(exception);

      try {
        await service.findOneBy(userId);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(exception.message);
        expect(e.errorCode).toBe(exception.errorCode);
      }
    });
  });
});
