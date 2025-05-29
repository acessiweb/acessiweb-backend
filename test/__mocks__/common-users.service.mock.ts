import { CommonUserService } from 'src/common-users/common-users.service';
import { CommonUser } from 'src/common-users/entities/common-user.entity';
import { RESOURCE_NOT_FOUND } from 'src/common/errors/errors-codes';
import CustomException from 'src/common/exceptions/custom-exception.exception';

export const commonUsersMock = [
  {
    id: 'commonUserId',
    username: 'pedro123',
  } as CommonUser,
  {
    id: 'commonUserId2',
    username: 'larissa123',
  } as CommonUser,
];

export const commonUserServiceMock = {
  provide: CommonUserService,
  useValue: {
    create: jest.fn().mockResolvedValue(() => {
      const newCommonUser = {
        id: 'commonUserIdNew',
        username: 'larissa123',
      } as CommonUser;

      commonUsersMock.push(newCommonUser);

      return newCommonUser.id;
    }),
    findOneBy: jest.fn().mockImplementation((id: string) => {
      const commonUser = commonUsersMock.find((c) => c.id === id);

      if (!commonUser) {
        return Promise.reject(
          new CustomException(`Usuário não encontrado`, RESOURCE_NOT_FOUND),
        );
      }

      return commonUser;
    }),
  },
};
