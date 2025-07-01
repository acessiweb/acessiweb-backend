import { Test, TestingModule } from '@nestjs/testing';
import { CommonUserProjectsController } from './common-users-projects.controller';
import { DataSource } from 'typeorm';
import {
  commonUserServiceMock,
  commonUsersMock,
} from 'test/__mocks__/common-users.service.mock';
import {
  guidelineServiceMock,
  guidelinesMock,
} from 'test/__mocks__/guidelines.service.mock';
import {
  PROJECT_ID_CREATED_MOCK,
  projectServiceMock,
} from 'test/__mocks__/projects.service.mock';
import { CreateCommonUserProjectDto } from './dto/create-common-user-project.dto';
import 'reflect-metadata';
import { CustomHttpException } from 'src/common/exceptions/custom-http.exception';

describe('CommonUsersProjectsController (unit)', () => {
  let controller: CommonUserProjectsController;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        projectServiceMock,
        commonUserServiceMock,
        guidelineServiceMock,
        {
          provide: DataSource,
          useValue: jest.fn(),
        },
      ],
      controllers: [CommonUserProjectsController],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);
    controller = module.get<CommonUserProjectsController>(
      CommonUserProjectsController,
    );
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  });

  describe('POST /projects', () => {
    it('should return the id of the project if project created successfully', async () => {
      const createNewCommonUserProjectDto = new CreateCommonUserProjectDto();
      createNewCommonUserProjectDto.name = 'Meu projeto';
      createNewCommonUserProjectDto.guidelines = [guidelinesMock[0].id];

      const result = await controller.create(
        commonUsersMock[0].id,
        createNewCommonUserProjectDto,
      );

      expect(result).toMatchObject({ id: PROJECT_ID_CREATED_MOCK });
    });

    it('should throw Custom Http Exception and not create project if user does not exist', async () => {
      const createNewCommonUserProjectDto = new CreateCommonUserProjectDto();
      createNewCommonUserProjectDto.name = 'Meu projeto';
      createNewCommonUserProjectDto.guidelines = [guidelinesMock[0].id];

      try {
        await controller.create('fgsdgsdfgdfg', createNewCommonUserProjectDto);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomHttpException);
        expect(e.response.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: 'Usuário não encontrado',
            }),
          ]),
        );
      }
    });

    it('should throw Custom Http Exception and not create project if no valid guideline', async () => {
      const createNewCommonUserProjectDto = new CreateCommonUserProjectDto();
      createNewCommonUserProjectDto.name = 'Meu projeto';
      createNewCommonUserProjectDto.guidelines = [
        'djfbgsjhdfbgsdf',
        'kdjsfgdjkngsdf',
      ];

      try {
        await controller.create(
          commonUsersMock[0].id,
          createNewCommonUserProjectDto,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(CustomHttpException);
        expect(e.response.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message:
                'O projeto precisa ter ao menos uma diretriz relacionada',
            }),
          ]),
        );
      }
    });
  });
});
