import { HttpStatus, Injectable } from '@nestjs/common';
import { Guideline } from './entities/guideline.entity';
import { CreateGuidelineDto } from './dto/create-guideline.dto';
import { UsersService } from 'src/users/users.service';
import { DeficiencesService } from 'src/deficiences/deficiences.service';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import {
  DELETE_OPERATION_FAILED,
  OPERATION_BLOCKED_BY_STATUS,
  REQUIRED_FIELD,
  RESOURCE_NOT_FOUND,
} from 'src/common/errors/errors-codes';
import { UpdateGuidelineDto } from './dto/update-guideline.dto';
import { GuidelinesRepository } from './guidelines.repository';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { ACCESS_ADMIN, ACCESS_USER } from 'src/common/constants/access';
import { getIdsToAdd, getIdsToRemove } from 'src/common/utils/filter';
import { ImageKitService } from 'src/imagekit/imagekit.service';
import { UploadResponse } from 'imagekit/dist/libs/interfaces';

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
    createGuidelineDto: CreateGuidelineDto,
    image: Express.Multer.File,
  ) {
    if (image && !createGuidelineDto.imageDesc) {
      this.throwImageDescNotInformed();
    }

    const [user, deficiences] = await Promise.all([
      this.usersService.findOneBy(createGuidelineDto.userId),
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
          'guidelines',
        );

        guideline.image = uploadRes.filePath;
      } catch (e) {
        console.log(e);
      }
    }

    guideline.imageDesc = createGuidelineDto.imageDesc!;
    guideline.user = user;
    guideline.deficiences = deficiences;

    if (user.role === 'user') {
      guideline.statusCode = 'PENDING';
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
      this.throwCantEditorDeleteGuideline('update');
    }

    if (image && !updateGuidelineDto.imageDesc) {
      this.throwImageDescNotInformed();
    }

    const currentIds = guideline.deficiences.map((def) => def.id);

    let uploadRes: UploadResponse = {} as UploadResponse;

    if (image) {
      try {
        await this.imageKitService.deleteImage(updateGuidelineDto.imageId!);
      } catch (e) {}

      try {
        uploadRes = await this.imageKitService.uploadImage(image, 'guidelines');
      } catch (e) {
        console.log(e);
      }
    }

    return await this.guidelinesRepo.update(
      id,
      updateGuidelineDto.name,
      updateGuidelineDto.desc,
      updateGuidelineDto.code!,
      uploadRes ? uploadRes.filePath : guideline.image,
      uploadRes ? uploadRes.fileId : guideline.imageId,
      updateGuidelineDto.imageDesc!,
      getIdsToAdd(currentIds, updateGuidelineDto.deficiences),
      getIdsToRemove(currentIds, updateGuidelineDto.deficiences),
      tokenPayload.role === ACCESS_ADMIN ? updateGuidelineDto.statusCode : '',
      tokenPayload.role === ACCESS_ADMIN ? updateGuidelineDto.statusMsg : '',
    );
  }

  async delete(id: string, tokenPayload: TokenPayloadDto) {
    const guideline = await this.findOne(id);

    if (
      tokenPayload.role === ACCESS_USER &&
      guideline.statusCode === 'APPROVED'
    ) {
      this.throwCantEditorDeleteGuideline('delete');
    }

    const deleted = await this.guidelinesRepo.delete(id);

    if (deleted.affected && deleted.affected > 0) {
      return {
        id,
      };
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
  }) {
    return await this.guidelinesRepo.findAll(query);
  }

  throwCantEditorDeleteGuideline(action: 'update' | 'delete') {
    throw new CustomException(
      `A solicitação não pode ser ${action === 'update' ? 'editada' : 'deletada'} pois ela está com status APROVADA`,
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
