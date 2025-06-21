import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommonUserDto } from './dto/create-common-user.dto';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import {
  CREATION_OPERATION_FAILED,
  DELETE_OPERATION_FAILED,
  RESOURCE_NOT_FOUND,
  UPDATE_OPERATION_FAILED,
} from 'src/common/errors/errors-codes';
import { CommonUsersRepository } from './common-users.repository';
import { AuthService } from 'src/auth/auth.service';
import { DataSource } from 'typeorm';
import { CommonUser } from './entities/common-user.entity';
import { UpdateCommonUserDto } from './dto/update-common-user.dto';

@Injectable()
export class CommonUserService {
  constructor(
    private readonly commonUserRepo: CommonUsersRepository,
    private readonly authService: AuthService,
    private readonly dataSource: DataSource,
  ) {}

  async findOneBy(id: string) {
    const user = await this.commonUserRepo.findOneBy(id);

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
    //enviar email ou sms de verificação

    try {
      return await this.dataSource.manager.transaction(
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

          return {
            id: user.id,
            role: user.role,
          };
        },
      );
    } catch (e) {
      if (e instanceof CustomException) {
        throw e;
      }

      throw new CustomException(
        `Não foi possível criar usuário`,
        CREATION_OPERATION_FAILED,
        [],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updateCommonUserDto: UpdateCommonUserDto) {
    await this.findOneBy(id);

    const updated = await this.commonUserRepo.update(id, updateCommonUserDto);

    if (updated.affected > 0) {
      const { username } = updated.raw[0];

      return { id, username };
    }

    throw new CustomException(
      `Não foi possível atualizar usuário id ${id}`,
      UPDATE_OPERATION_FAILED,
      [],
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async delete(id: string) {
    //TODO: testar
    await this.findOneBy(id);

    try {
      return await this.dataSource.manager.transaction(
        async (transactionalEntityManager) => {
          const deletedUser = await transactionalEntityManager.softDelete(
            'CommonUser',
            id,
          );

          const auth = await this.authService.findOne({ userId: id });

          await transactionalEntityManager.softDelete('Auth', auth.id);

          if (deletedUser.affected > 0) {
            return {
              id,
            };
          }

          throw new Error();
        },
      );
    } catch (e) {
      throw new CustomException(
        `Não foi possível deletar usuário id ${id}`,
        DELETE_OPERATION_FAILED,
        [],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
