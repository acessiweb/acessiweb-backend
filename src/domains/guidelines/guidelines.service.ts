import { HttpStatus, Injectable } from '@nestjs/common';
import { Guideline } from './entities/guideline.entity';
import { CreateGuidelineDto } from './dto/create-guideline.dto';
import { UsersService } from 'src/domains/users/users.service';
import { DeficiencesService } from 'src/domains/deficiences/deficiences.service';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import {
  DELETE_OPERATION_FAILED,
  OPERATION_BLOCKED_BY_STATUS,
  REQUIRED_FIELD,
  RESOURCE_NOT_FOUND,
} from 'src/common/constants/errors';
import { UpdateGuidelineDto } from './dto/update-guideline.dto';
import { GuidelinesRepository } from './guidelines.repository';
import { TokenPayloadDto } from 'src/services/auth/dto/token-payload.dto';
import { ACCESS_ADMIN, ACCESS_USER } from 'src/common/constants/access';
import { getIdsToAdd, getIdsToRemove } from 'src/common/utils/filter';
import { ImageKitService } from 'src/integrations/imagekit/imagekit.service';
import { UploadResponse } from 'imagekit/dist/libs/interfaces';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class GuidelinesService {
  constructor(
    private readonly guidelinesRepo: GuidelinesRepository,
    private readonly usersService: UsersService,
    private readonly deficiencesService: DeficiencesService,
    private readonly imageKitService: ImageKitService,
  ) {}

  async getSanitizedArrayOfIds(ids: string[]) {
    const removedDuplicate = new Set(ids);

    const data = [];

    for (let rd of removedDuplicate) {
      if (rd) {
        try {
          const found = await this.deficiencesService.findOneBy({
            name: rd,
          });
          data.push(found);
        } catch (e) {
          console.log(e);
        }
      }
    }

    return data;
  }

  async findOne(id: string) {
    const guideline = await this.guidelinesRepo.findOne(id);
    if (guideline) return guideline;
    throw new CustomException(
      `Diretriz com "${id}" não encontrada`,
      RESOURCE_NOT_FOUND,
    );
  }

  async create(
    userId: string,
    createGuidelineDto: CreateGuidelineDto,
    image: Express.Multer.File,
  ) {
    if (image && !createGuidelineDto.imageDesc) {
      this.throwImageDescNotInformed();
    }

    const [user, deficiences] = await Promise.all([
      this.usersService.findOneBy(userId),
      this.getSanitizedArrayOfIds(createGuidelineDto.deficiences),
    ]);

    if (deficiences.length === 0) {
      throw new CustomException(
        'A diretriz precisa ter ao menos uma deficiência válida relacionada',
        REQUIRED_FIELD,
        ['deficiences'],
        HttpStatus.BAD_REQUEST,
      );
    }

    const guideline = new Guideline();
    guideline.name = createGuidelineDto.name;
    guideline.description = createGuidelineDto.desc;
    guideline.code = createGuidelineDto.code!;

    if (image) {
      try {
        const uploadRes = await this.imageKitService.uploadImage(
          image,
          user.role === 'admin' ? 'guidelines' : 'guidelines-temp',
        );

        guideline.image = uploadRes.filePath;
        guideline.imageId = uploadRes.fileId;
      } catch (e) {
        console.log(e);
      }
    }

    guideline.imageDesc = createGuidelineDto.imageDesc!;
    guideline.user = user;
    guideline.deficiences = deficiences;

    if (user.role === 'user') {
      guideline.statusCode = 'STANDBY';
      guideline.isRequest = true;
    } else {
      guideline.statusCode = 'APPROVED';
      guideline.isRequest = false;
    }

    const guidelineSaved = await this.guidelinesRepo.create(guideline);

    return {
      id: guidelineSaved.id,
    };
  }

  async update(
    id: string,
    updateGuidelineDto: UpdateGuidelineDto,
    image: Express.Multer.File,
    tokenPayload: TokenPayloadDto,
  ) {
    const guideline = await this.findOne(id);

    if (
      tokenPayload.role === ACCESS_USER &&
      guideline.statusCode === 'APPROVED'
    ) {
      this.throwCantEditorDeleteGuideline('update', 'APROVADA');
    }

    if (
      tokenPayload.role === ACCESS_USER &&
      guideline.statusCode === 'PENDING'
    ) {
      this.throwCantEditorDeleteGuideline('update', 'PENDENTE');
    }

    if (image && !updateGuidelineDto.imageDesc) {
      this.throwImageDescNotInformed();
    }

    const currentIds = guideline.deficiences.map((def) => def.id);

    let uploadRes: UploadResponse = {} as UploadResponse;

    if (image && updateGuidelineDto.imageId) {
      try {
        await this.imageKitService.deleteImage(updateGuidelineDto.imageId);
      } catch (e) {
        console.log('An error occurred trying to delete image: ' + e);
      }

      try {
        uploadRes = await this.imageKitService.uploadImage(
          image,
          guideline.user.role === 'admin' ? 'guidelines' : 'guidelines-temp',
        );
      } catch (e) {
        console.log(e);
      }
    }

    const guidelineUpdated = await this.guidelinesRepo.update(
      id,
      updateGuidelineDto.name,
      updateGuidelineDto.desc,
      updateGuidelineDto.code,
      uploadRes ? uploadRes.filePath : guideline.image,
      uploadRes ? uploadRes.fileId : guideline.imageId,
      updateGuidelineDto.imageDesc,
      getIdsToAdd(currentIds, updateGuidelineDto.deficiences),
      getIdsToRemove(currentIds, updateGuidelineDto.deficiences),
    );

    if (
      tokenPayload.role === ACCESS_USER &&
      guidelineUpdated.statusCode === 'REJECTED'
    ) {
      const guidelineStatusUpdated = await this.updateStatus(id, {
        statusCode: 'PENDING',
      });

      return guidelineStatusUpdated;
    }

    return guidelineUpdated;
  }

  async updateStatus(id: string, updateStatusDto: UpdateStatusDto) {
    return await this.guidelinesRepo.updateStatus(
      id,
      updateStatusDto.statusCode,
      updateStatusDto.statusMsg,
    );
  }

  async delete(id: string, tokenPayload: TokenPayloadDto) {
    const guideline = await this.findOne(id);

    if (
      tokenPayload.role === ACCESS_USER &&
      guideline.statusCode === 'APPROVED'
    ) {
      this.throwCantEditorDeleteGuideline('delete', 'APROVADA');
    }

    if (
      tokenPayload.role === ACCESS_USER &&
      guideline.statusCode === 'PENDING'
    ) {
      this.throwCantEditorDeleteGuideline('delete', 'PENDENTE');
    }

    if (
      (tokenPayload.role === ACCESS_ADMIN && !guideline.isRequest) ||
      (tokenPayload.role === ACCESS_USER && guideline.isRequest)
    ) {
      const deleted = await this.guidelinesRepo.delete(id);

      if (deleted.affected && deleted.affected > 0) {
        return {
          id,
        };
      }
    }

    throw new CustomException(
      `Não foi possível deletar diretriz id ${id}`,
      DELETE_OPERATION_FAILED,
      [],
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async findAll(query: {
    limit: number;
    offset: number;
    userId?: string;
    deficiences?: string[];
    statusCode?: string;
    keyword?: string;
    initialDate?: Date;
    endDate?: Date;
    isRequest?: boolean;
    isDeleted?: boolean;
  }) {
    return await this.guidelinesRepo.findAll(query);
  }

  throwCantEditorDeleteGuideline(
    action: 'update' | 'delete',
    status: 'APROVADA' | 'PENDENTE',
  ) {
    throw new CustomException(
      `A solicitação não pode ser ${action === 'update' ? 'editada' : 'deletada'} pois ela está com status ${status}`,
      OPERATION_BLOCKED_BY_STATUS,
      [],
      HttpStatus.CONFLICT,
    );
  }

  throwImageDescNotInformed() {
    throw new CustomException(
      'Ao informar uma imagem, é necessário informar a descrição dela',
      REQUIRED_FIELD,
      ['imageDesc'],
      HttpStatus.BAD_REQUEST,
    );
  }
}
