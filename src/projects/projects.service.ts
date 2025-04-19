import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Deficiency } from './entities/deficiences.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DeficiencesService {
  constructor(
    @InjectRepository(Deficiency)
    private deficiencyRepository: Repository<Deficiency>,
  ) {}

  async findAll(): Promise<Deficiency[]> {
    return this.deficiencyRepository.find();
  }
}
