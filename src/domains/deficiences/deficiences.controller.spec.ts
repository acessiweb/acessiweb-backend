import { Test, TestingModule } from '@nestjs/testing';
import 'reflect-metadata';
import { DeficiencesController } from './deficiences.controller';
import {
  deficiencesMock,
  deficiencesServiceMock,
} from 'test/__mocks__/deficiences.service.mock';

describe('DeficiencesController (unit)', () => {
  let controller: DeficiencesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [deficiencesServiceMock],
      controllers: [DeficiencesController],
    }).compile();

    controller = module.get<DeficiencesController>(DeficiencesController);
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  });

  describe('GET /deficiences', () => {
    it('should return all registered deficiences', async () => {
      const deficiences = await controller.findAll();
      expect(deficiences).toStrictEqual(deficiencesMock);
    });
  });
});
