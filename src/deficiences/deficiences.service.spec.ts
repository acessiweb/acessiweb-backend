import { Test, TestingModule } from '@nestjs/testing';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { RESOURCE_NOT_FOUND } from 'src/common/errors/errors-codes';
import { DeficiencesService } from './deficiences.service';
import { Repository } from 'typeorm';
import { Deficiency } from './entities/deficiences.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { deficiencesMock } from 'test/__mocks__/deficiences.service.mock';

describe('DeficiencesService (unit)', () => {
  let service: DeficiencesService;
  let repo: Repository<Deficiency>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeficiencesService,
        {
          provide: getRepositoryToken(Deficiency),
          useValue: {
            findOneBy: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    repo = module.get<Repository<Deficiency>>(getRepositoryToken(Deficiency));
    service = module.get<DeficiencesService>(DeficiencesService);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  describe('findOne()', () => {
    it('should return deficiency if found', async () => {
      jest
        .spyOn(repo, 'findOneBy')
        .mockResolvedValue({ id: deficiencesMock[0].id } as Deficiency);

      const deficiency = await service.findOneBy(deficiencesMock[0].id);

      expect(deficiency).toStrictEqual({
        id: deficiencesMock[0].id,
      } as Deficiency);
    });

    it('should throw an error if deficiency not found', async () => {
      const deficiencyId = 'dfsdfsafds';

      jest
        .spyOn(repo, 'findOneBy')
        .mockRejectedValue(
          new CustomException(
            `Deficiência com id ${deficiencyId} não encontrada`,
            RESOURCE_NOT_FOUND,
          ),
        );

      try {
        await service.findOneBy(deficiencyId);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(
          `Deficiência com id ${deficiencyId} não encontrada`,
        );
      }
    });
  });

  describe('findAll()', () => {
    it('should return all registered deficiences', async () => {
      jest.spyOn(repo, 'find').mockResolvedValue(deficiencesMock);

      const deficiences = await service.findAll();

      expect(deficiences).toStrictEqual(deficiencesMock);
    });
  });
});
