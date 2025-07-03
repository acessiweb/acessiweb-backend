import { HttpStatus, Injectable } from '@nestjs/common';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { CREATION_OPERATION_FAILED } from 'src/common/errors/errors-codes';
import { AuthService } from 'src/auth/auth.service';
import { DataSource } from 'typeorm';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { AdminUser } from './entities/admin-user.entity';

@Injectable()
export class AdminUserService {
  constructor(
    private readonly authService: AuthService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createAdminUserDto: CreateAdminUserDto,
  ): Promise<{ id: string }> {
    try {
      return await this.dataSource.manager.transaction(
        async (transactionalEntityManager) => {
          const user = new AdminUser();
          const savedUser = await transactionalEntityManager.save(user);

          const auth = await this.authService.create(
            {
              email: createAdminUserDto.email,
              password: createAdminUserDto.password,
              confirmPassword: createAdminUserDto.password,
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
}
