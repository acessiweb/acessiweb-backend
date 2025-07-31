import { Guideline } from 'src/domains/guidelines/entities/guideline.entity';
import { GuidelinesService } from 'src/domains/guidelines/guidelines.service';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { RESOURCE_NOT_FOUND } from 'src/common/constants/errors';
import { usersMock } from './users.service.mock';
import { deficiencesMock } from './deficiences.service.mock';

export const guidelinesMock = [
  {
    id: 'guidelineId',
    name: 'Diretriz teste',
    description: 'Descrição da diretriz',
    deficiences: deficiencesMock,
    user: usersMock[0],
  } as Guideline,
  {
    id: 'guidelineId2',
    name: 'Diretriz teste 2',
    description: 'Descrição da diretriz 2',
    deficiences: deficiencesMock,
    user: usersMock[0],
  } as Guideline,
];

export const GUIDELINE_ID_CREATED_MOCK = 'guidelineId3';

export const guidelineServiceMock = {
  provide: GuidelinesService,
  useValue: {
    create: jest.fn().mockResolvedValue(() => {
      const newGuideline = {
        id: 'guidelineIdNew',
        name: 'Nova diretriz',
        deficiences: [deficiencesMock[0]],
        user: usersMock[0],
      } as Guideline;

      guidelinesMock.push(newGuideline);

      return newGuideline.id;
    }),
    findOne: jest.fn().mockImplementation((id: string) => {
      const guideline = guidelinesMock.find((c) => c.id === id);

      if (!guideline) {
        return Promise.reject(
          new CustomException(`Diretriz não encontrada`, RESOURCE_NOT_FOUND),
        );
      }

      return guideline;
    }),
  },
};
