import { Injectable } from '@nestjs/common';
import { CreateCommonUserDto } from './dto/create-common-user.dto';
import { DataSource, Repository } from 'typeorm';
import { CommonUser } from './entities/common-user.entity';
import { AuthService } from 'src/auth/auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { RESOURCE_NOT_FOUND } from 'src/common/errors/errors-codes';
import { updateCommonUserDto } from './dto/update-common-user.dto';

@Injectable()
export class CommonUserService {
  constructor(
    @InjectRepository(CommonUser)
    private readonly commonUserRepository: Repository<CommonUser>,
    private readonly authService: AuthService,
    private readonly dataSource: DataSource,
  ) {}

  async findOneBy(id: string): Promise<CommonUser> {
    const user = await this.commonUserRepository.findOneBy({ id });

    if (user) {
      return user;
    }

    throw new CustomException(
      `Usuário com id ${id} não encontrado`,
      RESOURCE_NOT_FOUND,
    );
  }

  async create(
    createCommonUserDto: CreateCommonUserDto,
  ): Promise<{ id: string }> {
    const userId = await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const user = new CommonUser();
        user.username = createCommonUserDto.username;

        const savedUser = await transactionalEntityManager.save(user);

        const auth = await this.authService.create(
          {
            email: createCommonUserDto.email,
            mobilePhone: createCommonUserDto.mobilePhone,
            password: createCommonUserDto.password,
            confirmPassword: createCommonUserDto.confirmPassword,
          },
          savedUser,
        );

        await transactionalEntityManager.save(auth);

        return user.id;
      },
    );

    //enviar email ou sms de verificação

    return {
      id: userId,
    };
  }

  async update(
    id: string,
    updateCommonUserDto: updateCommonUserDto,
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

  async delete(id: string) {
    return await this.commonUserRepository.softDelete(id);
  }
}
