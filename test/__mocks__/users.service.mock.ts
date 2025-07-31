import { RESOURCE_NOT_FOUND } from 'src/common/constants/errors';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { User } from 'src/domains/users/entities/user.entity';
import { UsersService } from 'src/domains/users/users.service';

export const usersMock = [
  {
    id: 'userId',
  } as User,
  {
    id: 'userId2',
  } as User,
];

export const userServiceMock = {
  provide: UsersService,
  useValue: {
    findOneBy: jest.fn().mockImplementation((id: string) => {
      const user = usersMock.find((c) => c.id === id);

      if (!user) {
        return Promise.reject(
          new CustomException(`Usuário não encontrado`, RESOURCE_NOT_FOUND),
        );
      }

      return user;
    }),
  },
};
