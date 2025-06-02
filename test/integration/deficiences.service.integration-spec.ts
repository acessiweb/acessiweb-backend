import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { Deficiency } from 'src/deficiences/entities/deficiences.entity';
import { DeficiencesService } from 'src/deficiences/deficiences.service';
import { DeficiencesModule } from 'src/deficiences/deficiences.module';
import { DatabaseSeederService } from 'test/database-seeder.service';
import { Guideline } from 'src/guidelines/entities/guideline.entity';
import { User } from 'src/users/entities/user.entity';

describe('DeficiencesService (integration)', () => {
  let app: INestApplication;
  let postgresContainer: StartedPostgreSqlContainer;
  let repo: Repository<Deficiency>;
  let service: DeficiencesService;
  let seeder: DatabaseSeederService;

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
          entities: [Deficiency],
        }),
        TypeOrmModule.forFeature([Deficiency, Guideline, User]),
        DeficiencesModule,
      ],
      providers: [DatabaseSeederService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    service = moduleFixture.get<DeficiencesService>(DeficiencesService);
    repo = moduleFixture.get<Repository<Deficiency>>(
      getRepositoryToken(Deficiency),
    );

    seeder = moduleFixture.get<DatabaseSeederService>(DatabaseSeederService);
    await seeder.seed();
  });

  afterEach(async () => {
    await Promise.all([app.close(), postgresContainer.stop()]);
  });

  describe('findAll()', () => {
    it('should return all deficiences', async () => {
      const deficiencesStored = await repo.find();
      const deficiences = await service.findAll();
      expect(deficiences).toEqual(deficiencesStored);
    });
  });
});
