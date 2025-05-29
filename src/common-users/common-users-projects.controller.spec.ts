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
  PROJECT_ID_UPDATED_MOCK,
  projectServiceMock,
  projectsMock,
} from 'test/__mocks__/projects.service.mock';
import { CreateCommonUserProjectDto } from '../common-users/dto/create-common-user-project.dto';
import 'reflect-metadata';
import { CustomHttpException } from 'src/common/exceptions/custom-http.exception';
import { UpdateProjectDto } from 'src/projects/dto/update-project.dto';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { Project } from 'src/projects/entities/project.entity';

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
    })
      .overrideGuard(AuthTokenGuard)
      .useValue({
        canActivate: jest.fn(() => true),
        extractTokenFromHeader: jest.fn(),
      })
      .compile();

    dataSource = module.get<DataSource>(DataSource);
    controller = module.get<CommonUserProjectsController>(
      CommonUserProjectsController,
    );
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  });

  describe('POST /common-users/:cuid/projects', () => {
    it('should return the id of the project if project created successfully', async () => {
      const createCommonUserProjectDto = new CreateCommonUserProjectDto();
      createCommonUserProjectDto.name = 'Meu projeto';
      createCommonUserProjectDto.guidelines = [guidelinesMock[0].id];

      const result = await controller.create(
        commonUsersMock[0].id,
        createCommonUserProjectDto,
      );

      expect(result).toMatchObject({ id: PROJECT_ID_CREATED_MOCK });
    });

    it('should throw Custom Http Exception if user does not exist', async () => {
      const createCommonUserProjectDto = new CreateCommonUserProjectDto();
      createCommonUserProjectDto.name = 'Meu projeto';
      createCommonUserProjectDto.guidelines = [guidelinesMock[0].id];

      try {
        await controller.create('fgsdgsdfgdfg', createCommonUserProjectDto);
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

    it('should throw Custom Http Exception if no valid guideline', async () => {
      const createCommonUserProjectDto = new CreateCommonUserProjectDto();
      createCommonUserProjectDto.name = 'Meu projeto';
      createCommonUserProjectDto.guidelines = [
        'djfbgsjhdfbgsdf',
        'kdjsfgdjkngsdf',
      ];

      try {
        await controller.create(
          commonUsersMock[0].id,
          createCommonUserProjectDto,
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

  describe('PUT /common-users/:cuid/projects/:pid', () => {
    it('should return the project if project updated successfully', async () => {
      const updateProjectDto = new UpdateProjectDto();
      updateProjectDto.name = 'Meu projeto';
      updateProjectDto.guidelines = [guidelinesMock[0].id];

      const result = await controller.update(
        PROJECT_ID_UPDATED_MOCK,
        updateProjectDto,
      );

      expect(result).toStrictEqual({
        name: updateProjectDto.name,
        guidelines: [guidelinesMock[0]],
        id: PROJECT_ID_UPDATED_MOCK,
        description: updateProjectDto.desc,
        feedback: updateProjectDto.feedback,
      } as Project);
    });

    it('should throw Custom Http Exception if project does not exist', async () => {
      const createCommonUserProjectDto = new CreateCommonUserProjectDto();
      createCommonUserProjectDto.name = 'Meu projeto';
      createCommonUserProjectDto.guidelines = [guidelinesMock[0].id];

      try {
        await controller.create('fgsdgsdfgdfg', createCommonUserProjectDto);
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
  });

  describe('DELETE /common-users/:cuid/projects/:pid', () => {
    it('should throw Custom Http Exception if project does not exist', async () => {
      try {
        await controller.delete('fgsdgsdfgdfg');
      } catch (e) {
        expect(e).toBeInstanceOf(CustomHttpException);
        expect(e.response.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: 'Projeto não encontrado',
            }),
          ]),
        );
      }
    });

    it("should throw Custom Http Exception if project can't be deleted", async () => {
      try {
        await controller.delete(projectsMock[0].id);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomHttpException);
        expect(e.response.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: `Não foi possível deletar projeto id ${projectsMock[0].id}`,
            }),
          ]),
        );
      }
    });

    it('should return project id if successfully deleted', async () => {
      const deleted = await controller.delete(projectsMock[0].id);
      expect(deleted).toEqual({ id: projectsMock[0].id });
    });
  });

  describe('GET /common-users/:cuid/projects/:pid', () => {
    it('should throw Custom Http Exception if project not found', async () => {
      try {
        await controller.findOne('adsdadasd');
      } catch (e) {
        expect(e).toBeInstanceOf(CustomHttpException);
        expect(e.response.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: 'Projeto não encontrado',
            }),
          ]),
        );
      }
    });

    it('should return project if found', async () => {
      const project = await controller.findOne(projectsMock[0].id);
      expect(project).toEqual(projectsMock[0]);
    });
  });

  describe('GET /common-users/:cuid/projects', () => {
    it('should throw Custom Http Exception if user does not exist', async () => {
      try {
        await controller.findAll('dfsadfasdfsadf');
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
  });
});
