import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { CommonUser } from './entities/common-user.entity';
import { UpdateCommonUserDto } from './dto/update-common-user.dto';

@Injectable()
export class CommonUsersRepository {
  constructor(
    @InjectRepository(CommonUser)
    private commonUserRepository: Repository<CommonUser>,
  ) {}

  async update(
    id: string,
    updateCommonUserDto: UpdateCommonUserDto,
  ): Promise<UpdateResult> {
    return await this.commonUserRepository
      .createQueryBuilder()
      .update(CommonUser)
      .set(updateCommonUserDto)
      .where('id = :id', { id: id })
      .returning(['username'])
      .execute();
  }

  async delete(id: string): Promise<UpdateResult> {
    return await this.commonUserRepository.softDelete(id);
  }

  async findOneBy(id: string): Promise<CommonUser | null> {
    return await this.commonUserRepository.findOneBy({ id });
  }
}
