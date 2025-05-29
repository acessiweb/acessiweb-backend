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
import {
  PROJECT_ID_CREATED_MOCK,
  PROJECT_ID_UPDATED_MOCK,
} from 'test/__mocks__/projects.service.mock';
import { ProjectsRepository } from './projects.repository';
import { UpdateProjectDto } from './dto/update-project.dto';
import { RESOURCE_NOT_FOUND } from 'src/common/errors/errors-codes';

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
    it('should throw Custom Exception and not create project if user does not exist', async () => {
      const createProjectDto = new CreateProjectDto();
      createProjectDto.name = 'Meu projeto';
      createProjectDto.guidelines = [guidelinesMock[0].id];
      createProjectDto.userId = 'sdfsdfsdfs';

      try {
        await service.create(createProjectDto);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe('Usuário não encontrado');
      }

      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should throw Custom Exception and not create project if no valid guideline', async () => {
      const createProjectDto = new CreateProjectDto();
      createProjectDto.name = 'Meu projeto';
      createProjectDto.desc = '';
      createProjectDto.guidelines = ['sdjfbgsdfjgnbdskfjg', 'kdjsfgdjkngsdf'];
      createProjectDto.userId = commonUsersMock[0].id;

      try {
        await service.create(createProjectDto);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(
          'O projeto precisa ter ao menos uma diretriz relacionada',
        );
      }

      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should return the id of the project if project created successfully', async () => {
      const createProjectDto = new CreateProjectDto();
      createProjectDto.name = 'Meu projeto';
      createProjectDto.guidelines = [guidelinesMock[0].id];
      createProjectDto.userId = commonUsersMock[0].id;

      const projectSaved = jest.spyOn(repo, 'create').mockResolvedValue({
        id: PROJECT_ID_CREATED_MOCK,
      } as Project);

      const response = await service.create(createProjectDto);

      expect(response).toMatchObject({
        id: PROJECT_ID_CREATED_MOCK,
      });
      expect(repo.create).toHaveBeenCalled();
      expect(repo.create).toHaveBeenCalledWith(expect.any(Project));
      await expect(projectSaved.mock.results[0].value).resolves.toStrictEqual({
        id: PROJECT_ID_CREATED_MOCK,
      });
    });
  });

  describe('update()', () => {
    it('should throw Custom Exception if project does not exist', async () => {
      const projId = 'dfsdfsafds';
      const updateProjectDto = new UpdateProjectDto();
      updateProjectDto.name = 'Nome do projeto atualizado';

      jest
        .spyOn(repo, 'findOne')
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
        expect(e.message).toBe(`Projeto com id ${projId} não encontrado`);
      }

      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should return project updated if updated sucessfully', async () => {
      const updateProjectDto = new UpdateProjectDto();
      updateProjectDto.name = 'Nome do projeto atualizado';
      updateProjectDto.guidelines = [guidelinesMock[1].id];

      jest.spyOn(repo, 'findOne').mockResolvedValue({
        id: PROJECT_ID_UPDATED_MOCK,
        name: 'Meu projeto',
        guidelines: [guidelinesMock[0]],
        user: commonUsersMock[0],
      } as Project);

      jest.spyOn(repo, 'update').mockResolvedValue({
        id: PROJECT_ID_UPDATED_MOCK,
        name: updateProjectDto.name,
        guidelines: [guidelinesMock[1]],
        feedback: '',
        description: '',
      } as Project);

      const projUpdated = await service.update(
        PROJECT_ID_UPDATED_MOCK,
        updateProjectDto,
      );

      expect(projUpdated.name).toBe(updateProjectDto.name);
      expect(projUpdated.guidelines).toEqual(
        expect.arrayContaining([guidelinesMock[1]]),
      );
    });
  });

  describe('delete()', () => {
    it('should return project id if sucessfully deleted', async () => {
      jest
        .spyOn(repo, 'findOne')
        .mockResolvedValue({ id: PROJECT_ID_UPDATED_MOCK } as Project);

      jest
        .spyOn(repo, 'delete')
        .mockResolvedValue({ affected: 1, generatedMaps: [], raw: {} });

      const projDeleted = await service.delete(PROJECT_ID_UPDATED_MOCK);

      expect(projDeleted).toStrictEqual({ id: PROJECT_ID_UPDATED_MOCK });
    });

    it('should throw a Custom Exception if project not deleted', async () => {
      jest
        .spyOn(repo, 'findOne')
        .mockResolvedValue({ id: PROJECT_ID_UPDATED_MOCK } as Project);

      jest
        .spyOn(repo, 'delete')
        .mockResolvedValue({ affected: 0, generatedMaps: [], raw: {} });

      try {
        await service.delete(PROJECT_ID_UPDATED_MOCK);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(
          `Não foi possível deletar projeto id ${PROJECT_ID_UPDATED_MOCK}`,
        );
      }
    });

    it('should throw a Custom Exception if project does not exist', async () => {
      const projId = 'asdasdasdasda';

      jest
        .spyOn(repo, 'findOne')
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
        expect(e.message).toBe(`Projeto com id ${projId} não encontrado`);
      }
    });
  });

  describe('findOne()', () => {
    it('should return project if found', async () => {
      jest
        .spyOn(repo, 'findOne')
        .mockResolvedValue({ id: PROJECT_ID_UPDATED_MOCK } as Project);

      const project = await service.findOne(PROJECT_ID_UPDATED_MOCK);

      expect(project).toStrictEqual({ id: PROJECT_ID_UPDATED_MOCK } as Project);
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
    });
  });
});
