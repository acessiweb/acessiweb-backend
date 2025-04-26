import { Injectable } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Guideline } from './entities/guideline.entity';
import { CreateGuidelineDto } from './dto/create-guideline.dto';
import { UsersService } from 'src/users/users.service';
import { DeficiencesService } from 'src/deficiences/deficiences.service';
import CustomException from 'src/exceptions/custom-exception.exception';
import { NOT_FOUND, REQUIRED_FIELD } from 'src/common/errors/errors-codes';

@Injectable()
export class GuidelinesService {
  constructor(
    @InjectRepository(Guideline)
    private guidelineRepository: Repository<Guideline>,
    private readonly usersService: UsersService,
    private readonly deficiencesService: DeficiencesService,
  ) {}

  async findOneBy(id: string) {
    try {
      const guideline = await this.guidelineRepository.findOneBy({ id });

      if (guideline) {
        console.log('hey');
        return guideline;
      }

      throw new CustomException('Diretriz não encontrada', NOT_FOUND);
    } catch (e) {
      if (e instanceof QueryFailedError) {
        throw new CustomException('Diretriz não encontrada', NOT_FOUND);
      }
    }
  }

  async create(createGuidelineDto: CreateGuidelineDto) {
    if (createGuidelineDto.image && !createGuidelineDto.imageDesc) {
      throw new CustomException(
        'Ao informar uma imagem, é necessário informar a descrição dela',
        REQUIRED_FIELD,
      );
    }

    const guideline = new Guideline();

    guideline.name = createGuidelineDto.name;

    guideline.description = createGuidelineDto.desc;

    guideline.code = createGuidelineDto.code;

    guideline.image = createGuidelineDto.image;

    guideline.imageDesc = createGuidelineDto.imageDesc;

    const [user, deficiencies] = await Promise.all([
      this.usersService.findOneBy(createGuidelineDto.userId),
      Promise.all(
        createGuidelineDto.deficiences.map((def) =>
          this.deficiencesService.findOneBy(def),
        ),
      ),
    ]);

    guideline.user = user;
    guideline.deficiences = deficiencies;

    if (user.role === 'common') {
      guideline.statusCode = 'PENDING';
      guideline.isRequest = true;
    } else {
      guideline.statusCode = 'APPROVED';
      guideline.isRequest = false;
    }

    await this.guidelineRepository.save(guideline);

    return {
      id: guideline.id,
    };
  }
}
