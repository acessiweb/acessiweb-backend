import { CommonUserService } from 'src/common-users/common-users.service';
import { CreateCommonUserDto } from 'src/common-users/dto/create-common-user.dto';
import { UpdateCommonUserDto } from 'src/common-users/dto/update-common-user.dto';
import { CommonUser } from 'src/common-users/entities/common-user.entity';
import {
  INVALID_DATA,
  RESOURCE_NOT_FOUND,
} from 'src/common/errors/errors-codes';
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

export const COMMON_USER_ID_CREATED_MOCK = 'user-id';

export const commonUserServiceMock = {
  provide: CommonUserService,
  useValue: {
    create: jest
      .fn()
      .mockImplementation((createCommonUserDto: CreateCommonUserDto) => {
        if (
          !/^[A-Za-z0-9]+( [A-Za-z0-9]+)*$/.test(createCommonUserDto.username)
        ) {
          return Promise.reject(
            new CustomException('Ocorreu um erro', INVALID_DATA),
          );
        }

        if (!createCommonUserDto.email && !createCommonUserDto.mobilePhone) {
          return Promise.reject(
            new CustomException('Ocorreu um erro', INVALID_DATA),
          );
        }

        return Promise.resolve({ id: COMMON_USER_ID_CREATED_MOCK });
      }),
    update: jest
      .fn()
      .mockImplementation(
        async (id: string, updateCommonUserDto: UpdateCommonUserDto) => {
          await commonUserServiceMock.useValue.findOneBy(id);
          if (
            !/^[A-Za-z0-9]+( [A-Za-z0-9]+)*$/.test(updateCommonUserDto.username)
          ) {
            return Promise.reject(
              new CustomException('Ocorreu um erro', INVALID_DATA),
            );
          }

          return Promise.resolve({
            id: commonUsersMock[0].id,
            username: updateCommonUserDto.username,
          } as CommonUser);
        },
      ),
    findOneBy: jest.fn().mockImplementation((id: string) => {
      const commonUser = commonUsersMock.find((c) => c.id === id);

      if (!commonUser) {
        return Promise.reject(
          new CustomException(`Usuário não encontrado`, RESOURCE_NOT_FOUND),
        );
      }

      return Promise.resolve(commonUser);
    }),
    delete: jest.fn().mockImplementation(async (id: string) => {
      await commonUserServiceMock.useValue.findOneBy(id);

      return Promise.resolve({
        id,
      });
    }),
  },
};
