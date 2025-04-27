import { Injectable } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import CustomException from 'src/exceptions/custom-exception.exception';
import { NOT_FOUND } from 'src/common/errors/errors-codes';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOneBy(id: string) {
    const user = await this.userRepository.findOneBy({ id });

    if (user) {
      return user;
    }

    throw new CustomException('Usuário não encontrado', NOT_FOUND);
  }
}
