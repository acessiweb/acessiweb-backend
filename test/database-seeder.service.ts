import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Deficiency } from 'src/deficiences/entities/deficiences.entity';
import { Guideline } from 'src/guidelines/entities/guideline.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DatabaseSeederService {
  constructor(
    @InjectRepository(Deficiency)
    private deficiencesRepo: Repository<Deficiency>,
    @InjectRepository(Guideline)
    private guidelinesRepo: Repository<Guideline>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async seed() {
    await Promise.all([this.seedDeficiences(), this.seedUsers()]);
    await this.seedGuidelines();
  }

  async seedDeficiences() {
    await Promise.all([
      this.deficiencesRepo.save({ name: 'Visual' }),
      this.deficiencesRepo.save({ name: 'Auditiva' }),
      this.deficiencesRepo.save({ name: 'Motora' }),
      this.deficiencesRepo.save({ name: 'Cognitiva e Neural' }),
      this.deficiencesRepo.save({ name: 'TEA' }),
    ]);
  }

  async seedUsers() {
    await Promise.all([
      this.usersRepo.save({
        role: 'user',
      }),
      this.usersRepo.save({
        role: 'user',
      }),
    ]);
  }

  async seedGuidelines() {
    const deficiences = await this.deficiencesRepo.find();
    const users = await this.usersRepo.find();

    const guideline1 = new Guideline();
    guideline1.name = 'Minha diretriz';
    guideline1.description = 'Descrição da minha diretriz';
    guideline1.deficiences = [deficiences[0]];
    guideline1.user = users[0];
    guideline1.statusCode = 'PENDING';
    guideline1.isRequest = true;

    const guideline2 = new Guideline();
    guideline2.name = 'Minha diretriz 2';
    guideline2.description = 'Descrição da minha diretriz 2';
    guideline2.deficiences = [deficiences[0], deficiences[1], deficiences[2]];
    guideline2.user = users[0];
    guideline2.statusCode = 'PENDING';
    guideline2.isRequest = true;

    const guideline3 = new Guideline();
    guideline3.name = 'Minha diretriz 3';
    guideline3.description = 'Descrição da minha diretriz 3';
    guideline3.deficiences = [deficiences[4]];
    guideline3.user = users[0];
    guideline3.statusCode = 'PENDING';
    guideline3.isRequest = true;

    await Promise.all([
      this.guidelinesRepo.save(guideline1),
      this.guidelinesRepo.save(guideline2),
      this.guidelinesRepo.save(guideline3),
    ]);
  }
}
