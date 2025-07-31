import { DeficiencesService } from 'src/domains/deficiences/deficiences.service';
import { Deficiency } from 'src/domains/deficiences/entities/deficiences.entity';

export const deficiencesMock = [
  {
    id: 'deficiencyId',
    name: 'Visual',
  } as Deficiency,
  {
    id: 'deficiency2Id',
    name: 'Motora',
  } as Deficiency,
  {
    id: 'deficiency3Id',
    name: 'Cognitiva e Neural',
  } as Deficiency,
  {
    id: 'deficiency4Id',
    name: 'Auditiva',
  } as Deficiency,
  {
    id: 'deficiency5Id',
    name: 'TEA',
  } as Deficiency,
];

export const deficiencesServiceMock = {
  provide: DeficiencesService,
  useValue: {
    findOneBy: jest.fn().mockResolvedValue(deficiencesMock[0]),
    findAll: jest.fn().mockResolvedValue(deficiencesMock),
  },
};
