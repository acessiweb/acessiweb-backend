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
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { DELETE_OPERATION_FAILED } from 'src/common/errors/errors-codes';

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

      expect(projectServiceMock.useValue.create).toHaveBeenCalledWith({
        ...createCommonUserProjectDto,
        userId: commonUsersMock[0].id,
      });
      expect(result).toMatchObject({ id: PROJECT_ID_CREATED_MOCK });
    });

    it('should throw Http Custom Exception error', async () => {
      const createCommonUserProjectDto = new CreateCommonUserProjectDto();
      createCommonUserProjectDto.name = 'Meu projeto';
      createCommonUserProjectDto.guidelines = [guidelinesMock[0].id];

      try {
        await controller.create('fgsdgsdfgdfg', createCommonUserProjectDto);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomHttpException);
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

      expect(projectServiceMock.useValue.update).toHaveBeenCalledWith(
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

    it('should throw Http Custom Exception error', async () => {
      const createCommonUserProjectDto = new CreateCommonUserProjectDto();
      createCommonUserProjectDto.name = 'Meu projeto';
      createCommonUserProjectDto.guidelines = [guidelinesMock[0].id];

      try {
        await controller.create('fgsdgsdfgdfg', createCommonUserProjectDto);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomHttpException);
      }
    });
  });

  describe('DELETE /common-users/:cuid/projects/:pid', () => {
    it('should throw Http Custom Exception error', async () => {
      const projectId = 'project-id';
      jest
        .spyOn(projectServiceMock.useValue, 'delete')
        .mockRejectedValue(
          new CustomException(
            `Não foi possível deletar projeto id ${projectId}`,
            DELETE_OPERATION_FAILED,
          ),
        );

      try {
        await controller.delete(projectId);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomHttpException);
      }
    });

    it('should return project id if successfully deleted', async () => {
      const mockResult = { id: projectsMock[0].id };
      jest
        .spyOn(projectServiceMock.useValue, 'delete')
        .mockResolvedValue(mockResult);

      const deleted = await controller.delete(projectsMock[0].id);
      expect(deleted).toStrictEqual(mockResult);
      expect(projectServiceMock.useValue.delete).toHaveBeenCalledWith(
        projectsMock[0].id,
      );
    });
  });

  describe('GET /common-users/:cuid/projects/:pid', () => {
    it('should throw Http Custom Exception error', async () => {
      try {
        await controller.findOne('adsdadasd');
      } catch (e) {
        expect(e).toBeInstanceOf(CustomHttpException);
      }
    });

    it('should return project if found', async () => {
      const project = await controller.findOne(projectsMock[0].id);
      expect(projectServiceMock.useValue.findOne).toHaveBeenCalledWith(
        projectsMock[0].id,
      );
      expect(project).toEqual(projectsMock[0]);
    });
  });

  describe('GET /common-users/:cuid/projects', () => {
    it('should return projects', async () => {
      const pagination = {
        limit: 20,
        offset: 0,
      };

      const projects = await controller.findAll(
        commonUsersMock[0].id,
        pagination,
      );

      expect(projectServiceMock.useValue.findAll).toHaveBeenCalledWith({
        limit: pagination.limit,
        offset: pagination.offset,
        commonUserId: commonUsersMock[0].id,
      });
      expect(projects).toStrictEqual(projectsMock);
    });
  });
});
