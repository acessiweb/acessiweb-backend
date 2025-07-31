import { CreateProjectDto } from '../../src/domains/projects/dto/create-project.dto';
import { Project } from '../../src/domains/projects/entities/project.entity';
import { ProjectsService } from '../../src/domains/projects/projects.service';
import { commonUserServiceMock } from './common-users.service.mock';
import {
  guidelineServiceMock,
  guidelinesMock,
} from './guidelines.service.mock';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import {
  REQUIRED_FIELD,
  RESOURCE_NOT_FOUND,
} from 'src/common/constants/errors';
import { HttpStatus } from '@nestjs/common';
import { UpdateProjectDto } from 'src/domains/projects/dto/update-project.dto';

export const projectsMock = [
  {
    id: 'p1',
    name: 'Projeto 1',
  } as Project,
  {
    id: 'p2',
    name: 'Projeto 2',
  } as Project,
];

export const PROJECT_ID_CREATED_MOCK = 'p3';
export const PROJECT_ID_UPDATED_MOCK = 'p1';

async function getGuidelines(guidesIds: string[]) {
  const removedDuplicate = new Set(guidesIds);
  const guidelines = [];

  try {
    for (let g of removedDuplicate) {
      const guideline = await guidelineServiceMock.useValue.findOne(g);
      guidelines.push(guideline);
    }
  } catch (e) {}

  return guidelines;
}

export const projectServiceMock = {
  provide: ProjectsService,
  useValue: {
    create: jest.fn().mockImplementation(async (dto: CreateProjectDto) => {
      const [user, guidelines] = await Promise.all([
        commonUserServiceMock.useValue.findOneBy(dto.userId),
        getGuidelines(dto.guidelines),
      ]);

      if (guidelines.length === 0) {
        return Promise.reject(
          new CustomException(
            'O projeto precisa ter ao menos uma diretriz relacionada',
            REQUIRED_FIELD,
            ['guidelines'],
            HttpStatus.BAD_REQUEST,
          ),
        );
      }

      const newProject = {
        id: PROJECT_ID_CREATED_MOCK,
        name: dto.name,
        user: user,
        guidelines: guidelines,
      } as Project;

      projectsMock.push(newProject);

      return Promise.resolve({
        id: newProject.id,
      });
    }),
    update: jest
      .fn()
      .mockImplementation(async (id: string, dto: UpdateProjectDto) => {
        await projectServiceMock.useValue.findOne(id);

        const guidelines = dto.guidelines.map((guide) =>
          guidelinesMock.find((g) => guide === g.id),
        );

        return Promise.resolve({
          id: PROJECT_ID_UPDATED_MOCK,
          name: dto.name,
          description: dto.desc,
          feedback: dto.feedback,
          guidelines,
        });
      }),
    findOne: jest.fn().mockImplementation((id: string) => {
      const project = projectsMock.find((c) => c.id === id);

      if (!project) {
        return Promise.reject(
          new CustomException(`Projeto não encontrado`, RESOURCE_NOT_FOUND),
        );
      }

      return Promise.resolve(project);
    }),
    delete: jest.fn().mockImplementation(async (id: string) => {
      await projectServiceMock.useValue.findOne(id);

      return Promise.resolve({
        id,
      });
    }),
    findAll: jest
      .fn()
      .mockImplementation(
        async (query: {
          commonUserId: string;
          keyword: string;
          limit: number;
          offset: number;
          initialDate: Date;
          endDate: Date;
        }) => {
          return projectsMock;
        },
      ),
  },
};
