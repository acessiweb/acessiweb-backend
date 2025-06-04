import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import {
  COMMON_USER_ID_CREATED_MOCK,
  commonUserServiceMock,
  commonUsersMock,
} from 'test/__mocks__/common-users.service.mock';
import 'reflect-metadata';
import { CustomHttpException } from 'src/common/exceptions/custom-http.exception';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { CommonUserController } from './common-users.controller';
import { CreateCommonUserDto } from './dto/create-common-user.dto';
import { UpdateCommonUserDto } from './dto/update-common-user.dto';
import { CommonUser } from './entities/common-user.entity';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { DELETE_OPERATION_FAILED } from 'src/common/errors/errors-codes';

describe('CommonUserController (unit)', () => {
  let controller: CommonUserController;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        commonUserServiceMock,
        {
          provide: DataSource,
          useValue: jest.fn(),
        },
      ],
      controllers: [CommonUserController],
    })
      .overrideGuard(AuthTokenGuard)
      .useValue({
        canActivate: jest.fn(() => true),
        extractTokenFromHeader: jest.fn(),
      })
      .compile();

    dataSource = module.get<DataSource>(DataSource);
    controller = module.get<CommonUserController>(CommonUserController);
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  });

  describe('POST /common-users', () => {
    it('should return user id if created succesfully', async () => {
      const createCommonUserDto = new CreateCommonUserDto();
      createCommonUserDto.username = 'laura123';
      createCommonUserDto.password = 'Laura@testes1';
      createCommonUserDto.confirmPassword = 'Laura@testes1';
      createCommonUserDto.email = 'lau@mail.com';

      const result = await controller.create(createCommonUserDto);

      expect(commonUserServiceMock.useValue.create).toHaveBeenCalledWith(
        createCommonUserDto,
      );
      expect(result).toMatchObject({ id: COMMON_USER_ID_CREATED_MOCK });
    });

    it('should throw Http Custom Exception error', async () => {
      const createCommonUserDto = new CreateCommonUserDto();
      createCommonUserDto.username = 'laura123_@';
      createCommonUserDto.password = 'Laura@testes1';
      createCommonUserDto.confirmPassword = 'Laura@testes1';
      createCommonUserDto.email = 'lau@mail.com';

      try {
        await controller.create(createCommonUserDto);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomHttpException);
      }
    });
  });

  describe('PUT /common-users/:cuid', () => {
    it('should return user if updated successfully', async () => {
      const updateCommonUserDto = new UpdateCommonUserDto();
      updateCommonUserDto.username = 'laura123';

      const result = await controller.update(
        commonUsersMock[0].id,
        updateCommonUserDto,
      );

      expect(result).toStrictEqual({
        id: commonUsersMock[0].id,
        username: updateCommonUserDto.username,
      } as CommonUser);
      expect(commonUserServiceMock.useValue.update).toHaveBeenCalledWith(
        commonUsersMock[0].id,
        updateCommonUserDto,
      );
    });

    it('should throw Http Custom Exception error', async () => {
      const updateCommonUserDto = new UpdateCommonUserDto();
      updateCommonUserDto.username = 'laura123_@';

      try {
        await controller.update(
          COMMON_USER_ID_CREATED_MOCK,
          updateCommonUserDto,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(CustomHttpException);
      }
    });
  });

  describe('DELETE /common-users/:cuid', () => {
    it('should return id if user deleted successfully', async () => {
      const response = await controller.delete(commonUsersMock[0].id);

      expect(response).toEqual({
        id: commonUsersMock[0].id,
      });
      expect(commonUserServiceMock.useValue.delete).toHaveBeenCalledWith(
        commonUsersMock[0].id,
      );
    });

    it('should throw Http Custom Exception error', async () => {
      jest
        .spyOn(commonUserServiceMock.useValue, 'delete')
        .mockRejectedValue(
          new CustomException('Ocorreu um erro', DELETE_OPERATION_FAILED),
        );
      try {
        await controller.delete(COMMON_USER_ID_CREATED_MOCK);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomHttpException);
      }
    });
  });

  describe('GET /common-users/:cuid', () => {
    it('should return user if found', async () => {
      const response = await controller.findOneBy(commonUsersMock[0].id);
      expect(response).toEqual(commonUsersMock[0]);
      expect(commonUserServiceMock.useValue.findOneBy).toHaveBeenCalledWith(
        commonUsersMock[0].id,
      );
    });

    it('should throw Http Custom Exception error', async () => {
      try {
        await controller.findOneBy(COMMON_USER_ID_CREATED_MOCK);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomHttpException);
      }
    });
  });
});
