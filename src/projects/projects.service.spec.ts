import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ProjectsService } from './projects.service';
import { CommonUserService } from '../common-users/common-users.service';
import { GuidelinesService } from '../guidelines/guidelines.service';
import { Project } from './entities/project.entity';
import { Guideline } from '../guidelines/entities/guideline.entity';

describe('ProjectsService.updateGuidelines', () => {
  let projectsService: ProjectsService;
  let dataSource: jest.Mocked<DataSource>;
  let guidelinesService: jest.Mocked<GuidelinesService>;
  let commonUserService: Partial<CommonUserService>;
  let projectRepository: Partial<Repository<Project>>;
  let qb: any;

  beforeEach(async () => {
    qb = {
      relation: jest.fn().mockReturnThis(),
      of: jest.fn().mockReturnThis(),
      loadMany: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
      add: jest.fn().mockResolvedValue(undefined),
    };

    dataSource = {
      createQueryBuilder: jest.fn().mockReturnValue(qb),
    } as any;

    guidelinesService = {
      findOneBy: jest.fn().mockResolvedValue({
        id: '123e4567-e89b-12d3-a456-426614174002',
      } as Guideline),
    } as any;

    commonUserService = {} as any;
    projectRepository = {} as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getRepositoryToken(Project), useValue: projectRepository },
        { provide: CommonUserService, useValue: commonUserService },
        { provide: GuidelinesService, useValue: guidelinesService },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    projectsService = module.get<ProjectsService>(ProjectsService);
  });

  it('should return an array of guidelines ids', async () => {
    qb.loadMany.mockResolvedValue([
      { id: '123e4567-e89b-12d3-a456-426614174000' },
      { id: '123e4567-e89b-12d3-a456-426614174001' },
    ] as Guideline[]);

    const projectId = 'proj-123';
    const newGuides = [
      '123e4567-e89b-12d3-a456-426614174001',
      '123e4567-e89b-12d3-a456-426614174002',
    ];

    const result = await (projectsService as any).updateGuidelines(
      projectId,
      newGuides,
    );

    expect(qb.relation).toHaveBeenCalledWith(Project, 'guidelines');
    expect(qb.of).toHaveBeenCalledWith(projectId);
    expect(qb.remove).toHaveBeenCalledWith([
      '123e4567-e89b-12d3-a456-426614174000',
    ]);
    expect(qb.add).toHaveBeenCalledWith([
      '123e4567-e89b-12d3-a456-426614174002',
    ]);
    expect(result).toEqual(newGuides);
  });

  it('não deve tocar na base quando os arrays forem iguais', async () => {
    qb.loadMany.mockResolvedValue([
      { id: '123e4567-e89b-12d3-a456-426614174000' },
      { id: '123e4567-e89b-12d3-a456-426614174001' },
    ] as Guideline[]);

    const projectId = 'proj-456';
    const sameGuides = [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
    ];

    const result = await (projectsService as any).updateGuidelines(
      projectId,
      sameGuides,
    );

    expect(qb.remove).not.toHaveBeenCalled();
    expect(qb.add).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});
