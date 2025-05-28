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
import { deficiencesMock } from 'test/__mocks__/deficiences.service.mock';
import { DeficiencesModule } from 'src/deficiences/deficiences.module';

describe('DeficiencesService (integration)', () => {
  let app: INestApplication;
  let postgresContainer: StartedPostgreSqlContainer;
  let repo: Repository<Deficiency>;
  let service: DeficiencesService;

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
        DeficiencesModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    service = moduleFixture.get<DeficiencesService>(DeficiencesService);
    repo = moduleFixture.get<Repository<Deficiency>>(
      getRepositoryToken(Deficiency),
    );
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    await postgresContainer.stop();
  });

  describe('findAll()', () => {
    it('should return all deficiences', async () => {
      const def1 = await repo.save({
        name: deficiencesMock[0].name,
      });

      const def2 = await repo.save({
        name: deficiencesMock[1].name,
      });

      const def3 = await repo.save({
        name: deficiencesMock[2].name,
      });

      const def4 = await repo.save({
        name: deficiencesMock[3].name,
      });

      const def5 = await repo.save({
        name: deficiencesMock[4].name,
      });

      const deficiences = await service.findAll();

      expect(deficiences).toEqual([def1, def2, def3, def4, def5]);
    });
  });
});
