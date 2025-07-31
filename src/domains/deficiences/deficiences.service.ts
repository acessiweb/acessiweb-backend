import { Injectable } from '@nestjs/common';
import { FindOperator, ILike, Repository } from 'typeorm';
import { Deficiency } from './entities/deficiences.entity';
import { InjectRepository } from '@nestjs/typeorm';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { RESOURCE_NOT_FOUND } from 'src/common/constants/errors';

@Injectable()
export class DeficiencesService {
  constructor(
    @InjectRepository(Deficiency)
    private deficiencyRepository: Repository<Deficiency>,
  ) {}

  async findOneBy({
    id,
    name,
  }: {
    id?: string;
    name?: string;
  }): Promise<Deficiency> {
    const q = {} as {
      id?: string;
      name?: FindOperator<string>;
    };

    if (id) {
      q['id'] = id;
    }

    if (name) {
      q['name'] = ILike(`%${name.toLowerCase()}%`);
    }

    const deficiency = await this.deficiencyRepository.findOneBy(q);

    if (deficiency) {
      return deficiency;
    }

    throw new CustomException(
      `Deficiência com ${id ? `id ${id}` : `nome ${name}`} não encontrada`,
      RESOURCE_NOT_FOUND,
    );
  }

  async findAll(): Promise<Deficiency[]> {
    return await this.deficiencyRepository.find();
  }
}
