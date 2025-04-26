import { Injectable } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { Deficiency } from './entities/deficiences.entity';
import { InjectRepository } from '@nestjs/typeorm';
import CustomException from 'src/exceptions/custom-exception.exception';
import { NOT_FOUND } from 'src/common/errors/errors-codes';

@Injectable()
export class DeficiencesService {
  constructor(
    @InjectRepository(Deficiency)
    private deficiencyRepository: Repository<Deficiency>,
  ) {}

  async findOneBy(id: string): Promise<Deficiency> {
    try {
      const deficiency = await this.deficiencyRepository.findOneBy({ id });

      if (!deficiency) {
        throw new CustomException('Deficiência não encontrada', NOT_FOUND);
      }

      return deficiency;
    } catch (e) {
      if (e instanceof QueryFailedError) {
        throw new CustomException('Deficiência não encontrada', NOT_FOUND);
      }
    }
  }

  async findAll(): Promise<Deficiency[]> {
    return await this.deficiencyRepository.find();
  }
}
