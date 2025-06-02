import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CommonUser } from 'src/common-users/entities/common-user.entity';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { DatabaseSeederService } from 'test/database-seeder.service';
import { Deficiency } from 'src/deficiences/entities/deficiences.entity';
import { User } from 'src/users/entities/user.entity';
import { Guideline } from 'src/guidelines/entities/guideline.entity';
import { CreateCommonUserDto } from 'src/common-users/dto/create-common-user.dto';
import { CommonUserService } from 'src/common-users/common-users.service';
import { CommonUserModule } from 'src/common-users/common-users.module';
import { Auth } from 'src/auth/entities/auth.entity';
import { ProjectsModule } from 'src/projects/projects.module';
import { DeficiencesModule } from 'src/deficiences/deficiences.module';
import { GuidelinesModule } from 'src/guidelines/guidelines.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { UpdateCommonUserDto } from 'src/common-users/dto/update-common-user.dto';

describe('CommonUserService (integration)', () => {
  let app: INestApplication;
  let postgresContainer: StartedPostgreSqlContainer;
  let repo: Repository<CommonUser>;
  let service: CommonUserService;
  let seeder: DatabaseSeederService;
  let authRepo: Repository<Auth>;

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
        TypeOrmModule.forFeature([Deficiency, Guideline, User, Auth]),
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

    service = moduleFixture.get<CommonUserService>(CommonUserService);
    repo = moduleFixture.get<Repository<CommonUser>>(
      getRepositoryToken(CommonUser),
    );
    authRepo = moduleFixture.get<Repository<Auth>>(getRepositoryToken(Auth));
    seeder = moduleFixture.get<DatabaseSeederService>(DatabaseSeederService);

    await seeder.seed();
  });

  afterAll(async () => {
    await postgresContainer.stop();
    await app.close();
  });

  describe('create()', () => {
    it('should return common user if successfully created', async () => {
      const createCommonUserDto = new CreateCommonUserDto();
      createCommonUserDto.username = 'laura123';
      createCommonUserDto.password = 'Laura@testes1';
      createCommonUserDto.confirmPassword = 'Laura@testes1';
      createCommonUserDto.email = 'lau@mail.com';

      const user = await service.create(createCommonUserDto);

      const found = await repo.findOne({
        where: {
          id: user.id,
        },
      });

      const auth = await authRepo.findOne({
        where: {
          user: {
            id: found.id,
          },
        },
        relations: {
          user: true,
        },
      });

      expect(found).toBeDefined();
      expect(found.username).toBe(createCommonUserDto.username);
      expect(user).toEqual({
        id: found.id,
      });
      expect(auth).toBeDefined();
      expect(auth.user.id).toBe(found.id);
    });

    it('should not create user if auth not created', async () => {
      const createCommonUserDto = new CreateCommonUserDto();
      createCommonUserDto.username = 'laura123';
      createCommonUserDto.password = 'Laura@testes1';
      createCommonUserDto.confirmPassword = 'Laura@testes1';

      const prevUsersLength = (await repo.find()).length;
      const prevAuthsLength = (await authRepo.find()).length;

      try {
        await service.create(createCommonUserDto);
      } catch (e) {}

      const afterUsersLength = (await repo.find()).length;
      const afterAuthsLength = (await authRepo.find()).length;

      expect(afterAuthsLength).toBe(prevAuthsLength);
      expect(prevUsersLength).toBe(afterUsersLength);
    });

    it('should not create auth if user not created', async () => {
      const createCommonUserDto = new CreateCommonUserDto();
      createCommonUserDto.username = 'laura123_#';
      createCommonUserDto.password = 'Laura@testes1';
      createCommonUserDto.confirmPassword = 'Laura@testes1';
      createCommonUserDto.email = 'lau@mail.com';

      const prevUsersLength = (await repo.find()).length;
      const prevAuthsLength = (await authRepo.find()).length;

      try {
        await service.create(createCommonUserDto);
      } catch (e) {}

      const afterUsersLength = (await repo.find()).length;
      const afterAuthsLength = (await authRepo.find()).length;

      expect(afterAuthsLength).toBe(prevAuthsLength);
      expect(prevUsersLength).toBe(afterUsersLength);
    });
  });

  describe('update()', () => {
    it('should update user with data informed and return it', async () => {
      const updateCommonUserDto = new UpdateCommonUserDto();
      updateCommonUserDto.username = 'novo username';

      const users = await repo.find();

      const updated = await service.update(users[0].id, updateCommonUserDto);

      expect(updated.username).toBe(updateCommonUserDto.username);
      expect(updated.id).toBe(users[0].id);
    });
  });

  describe('delete()', () => {
    it('should return id and be null if deleted successfully', async () => {
      const users = await repo.find();

      const deleted = await service.delete(users[0].id);

      const found = await repo.findOneBy({ id: users[0].id });

      expect(deleted).toEqual({
        id: users[0].id,
      });
      expect(found).toBeNull();
    });
  });
});
