import { Test, TestingModule } from '@nestjs/testing';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { GUIDELINE_ID_CREATED_MOCK } from 'test/__mocks__/guidelines.service.mock';
import { RESOURCE_NOT_FOUND } from 'src/common/errors/errors-codes';
import { GuidelinesService } from './guidelines.service';
import { GuidelinesRepository } from './guidelines.repository';
import { userServiceMock, usersMock } from 'test/__mocks__/users.service.mock';
import { CreateGuidelineDto } from './dto/create-guideline.dto';
import { Guideline } from './entities/guideline.entity';
import { UpdateGuidelineDto } from './dto/update-guideline.dto';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import {
  deficiencesMock,
  deficiencesServiceMock,
} from 'test/__mocks__/deficiences.service.mock';

describe('GuidelinesService (unit)', () => {
  let service: GuidelinesService;
  let repo: GuidelinesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuidelinesService,
        userServiceMock,
        deficiencesServiceMock,
        {
          provide: GuidelinesRepository,
          useValue: {
            update: jest.fn(),
            delete: jest.fn(),
            findOne: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    repo = module.get<GuidelinesRepository>(GuidelinesRepository);
    service = module.get<GuidelinesService>(GuidelinesService);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('should sanitize duplicate and invalid ids', async () => {
    const invalidId1 = 'dhjbfsdahfbasdf';
    const invalidId2 = 'ajshdbasdjhfbasdf';
    const ids1 = [invalidId1, invalidId2, deficiencesMock[0].id];
    const ids2 = [
      deficiencesMock[0].id,
      deficiencesMock[0].id,
      deficiencesMock[1].id,
    ];
    const ids3 = [invalidId1, deficiencesMock[0].id, deficiencesMock[0].id];
    const ids4 = [
      invalidId1,
      deficiencesMock[0].id,
      deficiencesMock[0].id,
      deficiencesMock[1].id,
    ];
    const ids5 = [invalidId2, invalidId1];

    const sanitized1 = await service.getSanitizedArrayOfIds(ids1);
    const sanitized2 = await service.getSanitizedArrayOfIds(ids2);
    const sanitized3 = await service.getSanitizedArrayOfIds(ids3);
    const sanitized4 = await service.getSanitizedArrayOfIds(ids4);
    const sanitized5 = await service.getSanitizedArrayOfIds(ids5);

    expect(sanitized1).toEqual(expect.arrayContaining([deficiencesMock[0]]));
    expect(sanitized2).toEqual(
      expect.arrayContaining([deficiencesMock[0], deficiencesMock[1]]),
    );
    expect(sanitized3).toEqual(expect.arrayContaining([deficiencesMock[0]]));
    expect(sanitized4).toEqual(
      expect.arrayContaining([deficiencesMock[0], deficiencesMock[1]]),
    );
    expect(sanitized5).toEqual([]);
  });

  describe('create()', () => {
    it('should throw Custom Exception and not create guideline if user send image without description', async () => {
      const createGuidelineDto = new CreateGuidelineDto();
      createGuidelineDto.name = 'Diretriz X';
      createGuidelineDto.desc = 'Descrição da diretriz X';
      createGuidelineDto.userId = 'sdfsdfsdfs';
      createGuidelineDto.image = 'dsjfbsdfdsahjb';

      try {
        await service.create(createGuidelineDto, {} as TokenPayloadDto);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(
          'Ao informar uma imagem, é necessário informar a descrição dela',
        );
      }

      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should throw Custom Exception and not create guideline if user does not exist', async () => {
      const createGuidelineDto = new CreateGuidelineDto();
      createGuidelineDto.name = 'Diretriz X';
      createGuidelineDto.desc = 'Descrição da diretriz X';
      createGuidelineDto.userId = 'sdfsdfsdfs';

      try {
        await service.create(createGuidelineDto, {} as TokenPayloadDto);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe('Usuário não encontrado');
      }

      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should throw Custom Exception and not create guideline if no valid deficiency', async () => {
      const createGuidelineDto = new CreateGuidelineDto();
      createGuidelineDto.name = 'Diretriz X';
      createGuidelineDto.desc = 'Descrição da diretriz X';
      createGuidelineDto.userId = usersMock[0].id;

      try {
        await service.create(createGuidelineDto, {} as TokenPayloadDto);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(
          'A diretriz precisa ter ao menos uma deficiência relacionada',
        );
      }

      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should return the id of the guideline if created successfully', async () => {
      const createGuidelineDto = new CreateGuidelineDto();
      createGuidelineDto.name = 'Diretriz X';
      createGuidelineDto.desc = 'Descrição da diretriz X';
      createGuidelineDto.userId = usersMock[0].id;
      createGuidelineDto.deficiences = [deficiencesMock[0].id];

      const guidelineSaved = jest.spyOn(repo, 'create').mockResolvedValue({
        id: GUIDELINE_ID_CREATED_MOCK,
      } as Guideline);

      const response = await service.create(
        createGuidelineDto,
        {} as TokenPayloadDto,
      );

      expect(response).toMatchObject({
        id: GUIDELINE_ID_CREATED_MOCK,
      });
      expect(repo.create).toHaveBeenCalled();
      expect(repo.create).toHaveBeenCalledWith(expect.any(Guideline));
      await expect(guidelineSaved.mock.results[0].value).resolves.toStrictEqual(
        {
          id: GUIDELINE_ID_CREATED_MOCK,
        },
      );
    });
  });

  describe('update()', () => {
    it('should throw Custom Exception if guideline does not exist', async () => {
      const guideId = 'dfsdfsafds';
      const updateGuidelineDto = new UpdateGuidelineDto();
      updateGuidelineDto.name = 'Nome da diretriza atualizada';

      jest
        .spyOn(repo, 'findOne')
        .mockRejectedValue(
          new CustomException(
            `Diretriz com id ${guideId} não encontrada`,
            RESOURCE_NOT_FOUND,
          ),
        );

      const tokenPayload = {
        role: 'admin',
      } as TokenPayloadDto;

      try {
        await service.update(guideId, updateGuidelineDto, tokenPayload);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(`Diretriz com id ${guideId} não encontrada`);
      }

      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should return guideline updated if updated sucessfully', async () => {
      const guideId = 'dfsdfsafds';
      const updateGuidelineDto = new UpdateGuidelineDto();
      updateGuidelineDto.name = 'Nome da diretriz atualizada';
      updateGuidelineDto.deficiences = [deficiencesMock[0].id];

      jest.spyOn(repo, 'findOne').mockResolvedValue({
        id: guideId,
        name: 'Minha diretriz',
        deficiences: [deficiencesMock[0]],
        user: usersMock[0],
      } as Guideline);

      jest.spyOn(repo, 'update').mockResolvedValue({
        id: guideId,
        name: updateGuidelineDto.name,
        deficiences: [deficiencesMock[1]],
      } as Guideline);

      const tokenPayload = {
        role: 'admin',
      } as TokenPayloadDto;

      const guideUpdated = await service.update(
        guideId,
        updateGuidelineDto,
        tokenPayload,
      );

      expect(guideUpdated.name).toBe(updateGuidelineDto.name);
      expect(guideUpdated.deficiences).toEqual(
        expect.arrayContaining([deficiencesMock[1]]),
      );
    });

    it('should throw Custom Exception if common user tries to update an APPROVED guideline', async () => {
      const guideId = 'dfsdfsafds';
      const updateGuidelineDto = new UpdateGuidelineDto();
      updateGuidelineDto.name = 'Nome da diretriza atualizada';
      updateGuidelineDto.deficiences = [deficiencesMock[0].id];

      jest.spyOn(repo, 'findOne').mockResolvedValue({
        id: guideId,
        name: 'Minha diretriz',
        deficiences: [deficiencesMock[0]],
        user: usersMock[0],
        statusCode: 'APPROVED',
      } as Guideline);

      const tokenPayload = {
        role: 'user',
      } as TokenPayloadDto;

      try {
        await service.update(guideId, updateGuidelineDto, tokenPayload);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(
          `A solicitação não pode ser editada pois ela está com status APROVADA`,
        );
      }

      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should throw Custom Exception and not update guideline if user send image without description', async () => {
      const guideId = 'dfsdfsafds';
      const updateGuidelineDto = new UpdateGuidelineDto();
      updateGuidelineDto.name = 'Diretriz X';
      updateGuidelineDto.desc = 'Descrição da diretriz X';
      updateGuidelineDto.image = 'adhfjbashdfbsaf';

      jest.spyOn(repo, 'findOne').mockResolvedValue({
        id: guideId,
        name: 'Minha diretriz',
        deficiences: [deficiencesMock[0]],
        user: usersMock[0],
        statusCode: 'PENDING',
      } as Guideline);

      const tokenPayload = {
        role: 'user',
      } as TokenPayloadDto;

      try {
        await service.update(guideId, updateGuidelineDto, tokenPayload);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(
          'Ao informar uma imagem, é necessário informar a descrição dela',
        );
      }

      expect(repo.update).not.toHaveBeenCalled();
    });
  });

  describe('delete()', () => {
    it('should return guideline id if sucessfully deleted', async () => {
      const guideId = 'dfsdfsafds';

      jest
        .spyOn(repo, 'findOne')
        .mockResolvedValue({ id: guideId } as Guideline);

      jest
        .spyOn(repo, 'delete')
        .mockResolvedValue({ affected: 1, generatedMaps: [], raw: {} });

      const tokenPayload = {
        role: 'user',
      } as TokenPayloadDto;

      const guideDeleted = await service.delete(guideId, tokenPayload);

      expect(guideDeleted).toStrictEqual({ id: guideId });
    });

    it('should throw a Custom Exception if guideline not deleted', async () => {
      const guideId = 'dfsdfsafds';

      jest
        .spyOn(repo, 'findOne')
        .mockResolvedValue({ id: guideId } as Guideline);

      jest
        .spyOn(repo, 'delete')
        .mockResolvedValue({ affected: 0, generatedMaps: [], raw: {} });

      const tokenPayload = {
        role: 'user',
      } as TokenPayloadDto;

      try {
        await service.delete(guideId, tokenPayload);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(
          `Não foi possível deletar diretriz id ${guideId}`,
        );
      }
    });

    it('should throw a Custom Exception if guideline does not exist', async () => {
      const guideId = 'dfsdfsafds';

      jest
        .spyOn(repo, 'findOne')
        .mockRejectedValue(
          new CustomException(
            `Diretriz com id ${guideId} não encontrada`,
            RESOURCE_NOT_FOUND,
          ),
        );

      const tokenPayload = {
        role: 'user',
      } as TokenPayloadDto;

      try {
        await service.delete(guideId, tokenPayload);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(`Diretriz com id ${guideId} não encontrada`);
      }
    });

    it('should throw Custom Exception if common user tries to delete an APPROVED guideline', async () => {
      const guideId = 'dfsdfsafds';

      jest.spyOn(repo, 'findOne').mockResolvedValue({
        id: guideId,
        name: 'Minha diretriz',
        deficiences: [deficiencesMock[0]],
        user: usersMock[0],
        statusCode: 'APPROVED',
      } as Guideline);

      const tokenPayload = {
        role: 'user',
      } as TokenPayloadDto;

      try {
        await service.delete(guideId, tokenPayload);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(
          `A solicitação não pode ser deletada pois ela está com status APROVADA`,
        );
      }

      expect(repo.update).not.toHaveBeenCalled();
    });
  });

  describe('findOne()', () => {
    it('should return guideline if found', async () => {
      const guideId = 'dfsdfsafds';

      jest
        .spyOn(repo, 'findOne')
        .mockResolvedValue({ id: guideId } as Guideline);

      const guideline = await service.findOne(guideId);

      expect(guideline).toStrictEqual({ id: guideId } as Guideline);
    });

    it('should throw an error if guideline not found', async () => {
      const guideId = 'dfsdfsafds';

      jest
        .spyOn(repo, 'findOne')
        .mockRejectedValue(
          new CustomException(
            `Diretriz com id ${guideId} não encontrada`,
            RESOURCE_NOT_FOUND,
          ),
        );

      try {
        await service.findOne(guideId);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(`Diretriz com id ${guideId} não encontrada`);
      }
    });
  });
});
