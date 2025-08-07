import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommonUserDto } from './dto/create-common-user.dto';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import {
  CREATION_OPERATION_FAILED,
  DELETE_OPERATION_FAILED,
  INVALID_DATA,
  RESOURCE_NOT_FOUND,
  UPDATE_OPERATION_FAILED,
} from 'src/common/constants/errors';
import { CommonUsersRepository } from './common-users.repository';
import { AuthService } from 'src/services/auth/auth.service';
import { DataSource } from 'typeorm';
import { CommonUser } from './entities/common-user.entity';
import { UpdateCommonUserDto } from './dto/update-common-user.dto';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CommonUserService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly commonUserRepo: CommonUsersRepository,
    private readonly authService: AuthService,
    private readonly dataSource: DataSource,
    private configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

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

    if (updated.affected && updated.affected > 0) {
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

          await transactionalEntityManager.softDelete('Auth', auth?.id);

          if (deletedUser.affected && deletedUser.affected > 0) {
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

  async validateGoogleAuth(idToken: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });
      const payload = ticket.getPayload();

      if (!payload || !payload.sub || !payload.email) {
        throw new CustomException('Google ID Token inválido', INVALID_DATA);
      }

      const auth = await this.authService.findOne({
        email: payload.email,
      });

      if (!auth) {
        try {
          const commonUser = await this.create({
            username: payload.name || '',
            email: payload.email,
            password: '',
            confirmPassword: '',
          });

          if (commonUser.id) {
            const auth2 = await this.authService.findOne({
              email: payload.email,
            });

            const tokens = await this.authService.createTokens(auth2!);
            return tokens;
          }
        } catch (e) {
          console.error(e);
          return;
        }
      }

      const tokens = await this.authService.createTokens(auth!);
      return tokens;
    } catch (error) {
      console.error('Google ID token verification failed:', error);
      return;
    }
  }
}
