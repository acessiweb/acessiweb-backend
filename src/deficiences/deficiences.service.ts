import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Deficiency } from './entities/deficiences.entity';
import { InjectRepository } from '@nestjs/typeorm';
import CustomException from 'src/exceptions/custom-exception.exception';
import { RESOURCE_NOT_FOUND } from 'src/common/errors/errors-codes';

@Injectable()
export class DeficiencesService {
  constructor(
    @InjectRepository(Deficiency)
    private deficiencyRepository: Repository<Deficiency>,
  ) {}

  async findOneBy(id: string): Promise<Deficiency> {
    const deficiency = await this.deficiencyRepository.findOneBy({ id });

    if (deficiency) {
      return deficiency;
    }

    throw new CustomException(
      `Deficiência com id ${id} não encontrada`,
      RESOURCE_NOT_FOUND,
    );
  }

  async findAll(): Promise<Deficiency[]> {
    return await this.deficiencyRepository.find();
  }
}
