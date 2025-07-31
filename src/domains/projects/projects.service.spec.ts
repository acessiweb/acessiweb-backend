import { Test, TestingModule } from '@nestjs/testing';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import {
  commonUserServiceMock,
  commonUsersMock,
} from 'test/__mocks__/common-users.service.mock';
import {
  guidelineServiceMock,
  guidelinesMock,
} from 'test/__mocks__/guidelines.service.mock';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsRepository } from './projects.repository';
import { UpdateProjectDto } from './dto/update-project.dto';
import { RESOURCE_NOT_FOUND } from 'src/common/constants/errors';
import { getIdsToAdd, getIdsToRemove } from 'src/common/utils/filter';

describe('ProjectsService (unit)', () => {
  let service: ProjectsService;
  let repo: ProjectsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        commonUserServiceMock,
        guidelineServiceMock,
        {
          provide: ProjectsRepository,
          useValue: {
            update: jest.fn(),
            delete: jest.fn(),
            findOne: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    repo = module.get<ProjectsRepository>(ProjectsRepository);
    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('should sanitize duplicate and invalid ids', async () => {
    const invalidId1 = 'dhjbfsdahfbasdf';
    const invalidId2 = 'ajshdbasdjhfbasdf';
    const ids1 = [invalidId1, invalidId2, guidelinesMock[0].id];
    const ids2 = [
      guidelinesMock[0].id,
      guidelinesMock[0].id,
      guidelinesMock[1].id,
    ];
    const ids3 = [invalidId1, guidelinesMock[0].id, guidelinesMock[0].id];
    const ids4 = [
      invalidId1,
      guidelinesMock[0].id,
      guidelinesMock[0].id,
      guidelinesMock[1].id,
    ];
    const ids5 = [invalidId2, invalidId1];

    const sanitized1 = await service.getSanitizedArrayOfIds(ids1);
    const sanitized2 = await service.getSanitizedArrayOfIds(ids2);
    const sanitized3 = await service.getSanitizedArrayOfIds(ids3);
    const sanitized4 = await service.getSanitizedArrayOfIds(ids4);
    const sanitized5 = await service.getSanitizedArrayOfIds(ids5);

    expect(sanitized1).toEqual(expect.arrayContaining([guidelinesMock[0]]));
    expect(sanitized2).toEqual(
      expect.arrayContaining([guidelinesMock[0], guidelinesMock[1]]),
    );
    expect(sanitized3).toEqual(expect.arrayContaining([guidelinesMock[0]]));
    expect(sanitized4).toEqual(
      expect.arrayContaining([guidelinesMock[0], guidelinesMock[1]]),
    );
    expect(sanitized5).toEqual([]);
  });

  describe('create()', () => {
    it('should not call projRepo.create if user does not exist', async () => {
      const createProjectDto = new CreateProjectDto();
      createProjectDto.name = 'Meu projeto';
      createProjectDto.guidelines = [guidelinesMock[0].id];
      createProjectDto.userId = 'sdfsdfsdfs';

      jest
        .spyOn(service, 'getSanitizedArrayOfIds')
        .mockResolvedValue(createProjectDto.guidelines);

      try {
        await service.create(createProjectDto);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
      }

      expect(commonUserServiceMock.useValue.findOneBy).toHaveBeenCalledWith(
        createProjectDto.userId,
      );
      expect(service.getSanitizedArrayOfIds).toHaveBeenCalledWith(
        createProjectDto.guidelines,
      );
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should throw Custom Exception and not create project if no valid guideline', async () => {
      const createProjectDto = new CreateProjectDto();
      createProjectDto.name = 'Meu projeto';
      createProjectDto.desc = '';
      createProjectDto.guidelines = ['sdjfbgsdfjgnbdskfjg', 'kdjsfgdjkngsdf'];
      createProjectDto.userId = commonUsersMock[0].id;

      jest.spyOn(service, 'getSanitizedArrayOfIds').mockResolvedValue([]);

      try {
        await service.create(createProjectDto);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(
          'O projeto precisa ter ao menos uma diretriz relacionada',
        );
      }

      expect(commonUserServiceMock.useValue.findOneBy).toHaveBeenCalledWith(
        createProjectDto.userId,
      );
      expect(service.getSanitizedArrayOfIds).toHaveBeenCalledWith(
        createProjectDto.guidelines,
      );
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should return the id of the project if project created successfully', async () => {
      const createProjectDto = new CreateProjectDto();
      createProjectDto.name = 'Meu projeto';
      createProjectDto.guidelines = [guidelinesMock[0].id];
      createProjectDto.userId = commonUsersMock[0].id;

      jest
        .spyOn(service, 'getSanitizedArrayOfIds')
        .mockResolvedValue(createProjectDto.guidelines);

      const mockResult = {
        id: 'project-id',
      } as Project;

      const projectSaved = jest
        .spyOn(repo, 'create')
        .mockResolvedValue(mockResult);

      const response = await service.create(createProjectDto);

      expect(commonUserServiceMock.useValue.findOneBy).toHaveBeenCalledWith(
        createProjectDto.userId,
      );
      expect(service.getSanitizedArrayOfIds).toHaveBeenCalledWith(
        createProjectDto.guidelines,
      );
      expect(response).toStrictEqual(mockResult);
      expect(repo.create).toHaveBeenCalledWith(expect.any(Project));
      await expect(projectSaved.mock.results[0].value).resolves.toStrictEqual(
        mockResult,
      );
    });
  });

  describe('update()', () => {
    it('should not call projRepo.update if project does not exist', async () => {
      const projId = 'dfsdfsafds';
      const updateProjectDto = new UpdateProjectDto();
      updateProjectDto.name = 'Nome do projeto atualizado';

      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(
          new CustomException(
            `Projeto com id ${projId} não encontrado`,
            RESOURCE_NOT_FOUND,
          ),
        );

      try {
        await service.update(projId, updateProjectDto);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
      }

      expect(service.findOne).toHaveBeenCalledWith(projId);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should return project updated if updated sucessfully', async () => {
      const projectId = 'project-id';
      const updateProjectDto = new UpdateProjectDto();
      updateProjectDto.name = 'Nome do projeto atualizado';
      updateProjectDto.guidelines = [guidelinesMock[1].id];

      const mockResult = {
        id: projectId,
        name: 'Meu projeto',
        guidelines: [guidelinesMock[0]],
        user: commonUsersMock[0],
        feedback: '',
        description: '',
      } as Project;

      jest.spyOn(service, 'findOne').mockResolvedValue(mockResult);

      mockResult.name = updateProjectDto.name;
      mockResult.guidelines = [guidelinesMock[1]];

      jest.spyOn(repo, 'update').mockResolvedValue([
        {
          raw: [mockResult],
          affected: 1,
          generatedMaps: [],
        },
        null,
        null,
      ]);

      const projUpdated = await service.update(projectId, updateProjectDto);

      expect(service.findOne).toHaveBeenCalledWith(projectId);
      expect(projUpdated.name).toBe(updateProjectDto.name);
      expect(projUpdated.guidelines).toEqual(
        expect.arrayContaining([guidelinesMock[1]]),
      );
    });
  });

  describe('delete()', () => {
    it('should return project id if sucessfully deleted', async () => {
      const projectId = 'project-id';

      const mockResult = { id: projectId } as Project;

      jest.spyOn(service, 'findOne').mockResolvedValue(mockResult);

      jest
        .spyOn(repo, 'delete')
        .mockResolvedValue({ affected: 1, generatedMaps: [], raw: {} });

      const projDeleted = await service.delete(projectId);

      expect(service.findOne).toHaveBeenCalledWith(projectId);
      expect(repo.delete).toHaveBeenCalledWith(projectId);
      expect(projDeleted).toStrictEqual(mockResult);
    });

    it('should throw a Custom Exception if project not deleted', async () => {
      const projectId = 'project-id';
      const mockResult = { id: projectId } as Project;

      jest.spyOn(service, 'findOne').mockResolvedValue(mockResult);

      jest
        .spyOn(repo, 'delete')
        .mockResolvedValue({ affected: 0, generatedMaps: [], raw: {} });

      try {
        await service.delete(projectId);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(
          `Não foi possível deletar projeto id ${projectId}`,
        );
      }

      expect(service.findOne).toHaveBeenCalledWith(projectId);
    });

    it('should not call projRepo.delete if project does not exist', async () => {
      const projId = 'asdasdasdasda';

      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(
          new CustomException(
            `Projeto com id ${projId} não encontrado`,
            RESOURCE_NOT_FOUND,
          ),
        );

      try {
        await service.delete(projId);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
      }

      expect(service.findOne).toHaveBeenCalledWith(projId);
      expect(repo.delete).not.toHaveBeenCalled();
    });
  });

  describe('findOne()', () => {
    it('should return project if found', async () => {
      const projectId = 'project-id';

      const mockResult = { id: projectId } as Project;

      jest.spyOn(repo, 'findOne').mockResolvedValue(mockResult);

      const project = await service.findOne(projectId);

      expect(repo.findOne).toHaveBeenCalledWith(projectId);
      expect(project).toStrictEqual(mockResult);
    });

    it('should throw a Custom Exception if project not found', async () => {
      const projId = 'sadasdasdsadasdsa';

      jest
        .spyOn(repo, 'findOne')
        .mockRejectedValue(
          new CustomException(
            `Projeto com id ${projId} não encontrado`,
            RESOURCE_NOT_FOUND,
          ),
        );

      try {
        await service.findOne(projId);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(`Projeto com id ${projId} não encontrado`);
      }

      expect(repo.findOne).toHaveBeenCalledWith(projId);
    });
  });
});
