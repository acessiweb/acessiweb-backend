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
  ): Promise<{ id: string; username: string }> {
    const updated = await this.commonUserRepository
      .createQueryBuilder()
      .update(CommonUser)
      .set(updateCommonUserDto)
      .where('id = :id', { id: id })
      .returning(['username'])
      .execute();

    const { username } = updated.raw[0];

    return { id, username };
  }

  async delete(id: string): Promise<UpdateResult> {
    return await this.commonUserRepository.softDelete(id);
  }

  async findOneBy(id: string): Promise<CommonUser> {
    return await this.commonUserRepository.findOneBy({ id });
  }
}
