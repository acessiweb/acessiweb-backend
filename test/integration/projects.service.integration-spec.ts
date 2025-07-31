import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProjectsService } from 'src/domains/projects/projects.service';
import { CommonUser } from 'src/common-users/entities/common-user.entity';
import { Project } from 'src/domains/projects/entities/project.entity';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { ProjectsModule } from 'src/domains/projects/projects.module';
import { CreateProjectDto } from 'src/domains/projects/dto/create-project.dto';
import { DatabaseSeederService } from 'test/database-seeder.service';
import { Deficiency } from 'src/domains/deficiences/entities/deficiences.entity';
import { User } from 'src/domains/users/entities/user.entity';
import { Guideline } from 'src/domains/guidelines/entities/guideline.entity';
import { UpdateProjectDto } from 'src/domains/projects/dto/update-project.dto';
import { DeficiencesModule } from 'src/domains/deficiences/deficiences.module';
import { GuidelinesModule } from 'src/domains/guidelines/guidelines.module';
import { UsersModule } from 'src/domains/users/users.module';
import { AuthModule } from 'src/services/auth/auth.module';
import { CommonUserModule } from 'src/common-users/common-users.module';

describe('ProjectsService (integration)', () => {
  let app: INestApplication;
  let postgresContainer: StartedPostgreSqlContainer;
  let repo: Repository<Project>;
  let service: ProjectsService;
  let seeder: DatabaseSeederService;
  let guidesRepo: Repository<Guideline>;
  let usersRepo: Repository<User>;

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer().start();
  }, 60_000);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          url: postgresContainer.getConnectionUri(),
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([Deficiency, Guideline, User]),
        DeficiencesModule,
        GuidelinesModule,
        UsersModule,
        AuthModule,
        ProjectsModule,
        CommonUserModule,
      ],
      providers: [DatabaseSeederService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    service = moduleFixture.get<ProjectsService>(ProjectsService);
    usersRepo = moduleFixture.get<Repository<CommonUser>>(
      getRepositoryToken(CommonUser),
    );
    repo = moduleFixture.get<Repository<Project>>(getRepositoryToken(Project));
    guidesRepo = moduleFixture.get<Repository<Guideline>>(
      getRepositoryToken(Guideline),
    );

    seeder = moduleFixture.get<DatabaseSeederService>(DatabaseSeederService);
    await seeder.seed();
  });

  afterAll(async () => {
    await postgresContainer.stop();
    await app.close();
  });

  describe('create()', () => {
    it('should return the project if successfully created', async () => {
      const guidelines = await guidesRepo.find();
      const users = await usersRepo.find();

      const createProjectDto = new CreateProjectDto();
      createProjectDto.name = 'Meu projeto';
      createProjectDto.guidelines = [guidelines[0].id, guidelines[1].id];
      createProjectDto.userId = users[0].id;

      const project = await service.create(createProjectDto);

      const found = await repo.findOne({
        where: {
          id: project.id,
        },
        relations: {
          user: true,
          guidelines: true,
        },
      });

      expect(found).toBeDefined();
      expect(found.name).toBe(createProjectDto.name);
      expect(found.user.id).toBe(users[0].id);
      expect(found.guidelines.length).toBeGreaterThan(0);
      expect(project).toEqual({
        id: found.id,
      });
    });
  });

  describe('update()', () => {
    it('should update project with data informed and return it', async () => {
      const guidelines = await guidesRepo.find();
      const users = await usersRepo.find();

      const createProjectDto = new CreateProjectDto();
      createProjectDto.name = 'Meu projeto';
      createProjectDto.guidelines = [guidelines[0].id, guidelines[1].id];
      createProjectDto.userId = users[0].id;

      const project = await service.create(createProjectDto);

      const updateProjectDto = new UpdateProjectDto();
      updateProjectDto.name = 'Meu projeto editado';
      updateProjectDto.guidelines = [guidelines[0].id];

      const updatedProject = await service.update(project.id, updateProjectDto);

      expect(updatedProject).toBeDefined();
      expect(updatedProject.name).toBe(updateProjectDto.name);
      expect(updatedProject.id).toBe(project.id);
      expect(updatedProject.guidelines).toEqual(
        expect.not.arrayContaining([guidelines[1]]),
      );
    });
  });

  describe('delete()', () => {
    it('should return id and be null if deleted successfully', async () => {
      const guidelines = await guidesRepo.find();
      const users = await usersRepo.find();

      const createProjectDto = new CreateProjectDto();
      createProjectDto.name = 'Meu projeto';
      createProjectDto.guidelines = [guidelines[0].id, guidelines[1].id];
      createProjectDto.userId = users[0].id;

      const project = await service.create(createProjectDto);

      const deletedProject = await service.delete(project.id);

      const found = await repo.findOneBy({ id: project.id });

      expect(deletedProject).toEqual({
        id: project.id,
      });
      expect(found).toBeNull();
    });
  });

  describe('findAll()', () => {
    const pagination = {
      limit: 20,
      offset: 0,
    };

    it("should return user's projects", async () => {
      const guidelines = await guidesRepo.find();
      const users = await usersRepo.find();

      const createProjectDto = new CreateProjectDto();
      createProjectDto.name = 'Meu projeto';
      createProjectDto.guidelines = [guidelines[0].id, guidelines[1].id];
      createProjectDto.userId = users[0].id;

      const project1Id = await service.create(createProjectDto);

      const createProjectDto2 = new CreateProjectDto();
      createProjectDto2.name = 'Meu projeto 2';
      createProjectDto2.guidelines = [guidelines[0].id];
      createProjectDto2.userId = users[1].id;

      const project2Id = await service.create(createProjectDto2);

      const projects = await service.findAll({
        commonUserId: users[0].id,
        limit: pagination.limit,
        offset: pagination.offset,
      });

      const project1 = await service.findOne(project1Id.id);
      const project2 = await service.findOne(project2Id.id);

      expect(projects.data).toEqual(expect.not.arrayContaining([project2]));
      expect(projects.data).toEqual(expect.arrayContaining([project1]));
    });

    it('should return projects that match given keyword', async () => {
      const guidelines = await guidesRepo.find();
      const users = await usersRepo.find();

      const createProjectDto = new CreateProjectDto();
      createProjectDto.name = 'Meu projeto';
      createProjectDto.guidelines = [guidelines[0].id, guidelines[1].id];
      createProjectDto.userId = users[0].id;

      const project1Id = await service.create(createProjectDto);

      const createProjectDto2 = new CreateProjectDto();
      createProjectDto2.name = 'Acessiweb';
      createProjectDto2.guidelines = [guidelines[0].id];
      createProjectDto2.userId = users[0].id;

      const project2Id = await service.create(createProjectDto2);

      const createProjectDto3 = new CreateProjectDto();
      createProjectDto3.name = 'Meu projeto';
      createProjectDto3.desc = 'Acessiweb';
      createProjectDto3.guidelines = [guidelines[0].id];
      createProjectDto3.userId = users[0].id;

      const project3Id = await service.create(createProjectDto3);

      const projects = await service.findAll({
        commonUserId: users[0].id,
        keyword: 'Acessiweb',
        limit: pagination.limit,
        offset: pagination.offset,
      });

      const project1 = await service.findOne(project1Id.id);
      const project2 = await service.findOne(project2Id.id);
      const project3 = await service.findOne(project3Id.id);

      expect(projects.data).toEqual(expect.not.arrayContaining([project1]));
      expect(projects.data).toEqual(
        expect.arrayContaining([project2, project3]),
      );
    });

    it('should return projects that were registered at given dates', async () => {
      const guidelines = await guidesRepo.find();
      const users = await usersRepo.find();

      const createProjectDto = new CreateProjectDto();
      createProjectDto.name = 'Meu projeto';
      createProjectDto.guidelines = [guidelines[0].id, guidelines[1].id];
      createProjectDto.userId = users[0].id;

      const project1Id = await service.create(createProjectDto);

      const createProjectDto2 = new CreateProjectDto();
      createProjectDto2.name = 'Meu projeto 2';
      createProjectDto2.guidelines = [guidelines[0].id];
      createProjectDto2.userId = users[1].id;

      await service.create(createProjectDto2);

      const date = new Date();

      const projects = await service.findAll({
        commonUserId: users[0].id,
        initialDate: new Date(
          `${date.getFullYear()}-${date.getMonth() + 3}-${date.getDay() + 3}`,
        ),
        limit: pagination.limit,
        offset: pagination.offset,
      });

      const projects2 = await service.findAll({
        commonUserId: users[0].id,
        initialDate: date,
        limit: pagination.limit,
        offset: pagination.offset,
      });

      const project1 = await service.findOne(project1Id.id);

      expect(projects.data).toEqual([]);
      expect(projects2.data).toEqual(expect.arrayContaining([project1]));
    });
  });
});
