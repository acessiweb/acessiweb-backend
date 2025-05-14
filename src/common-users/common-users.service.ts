import { Injectable } from '@nestjs/common';
import { CreateCommonUserDto } from './dto/create-common-user.dto';
import { Repository } from 'typeorm';
import { CommonUser } from './entities/common-user.entity';
import { AuthService } from 'src/auth/auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import CustomException from 'src/exceptions/custom-exception.exception';
import { RESOURCE_NOT_FOUND } from 'src/common/errors/errors-codes';

@Injectable()
export class CommonUserService {
  constructor(
    @InjectRepository(CommonUser)
    private readonly commonUserRepository: Repository<CommonUser>,
    private readonly authService: AuthService,
  ) {}

  async findOneBy(id: string) {
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
    const user = new CommonUser();

    await this.authService.create(
      {
        email: createCommonUserDto.email,
        mobilePhone: createCommonUserDto.mobilePhone,
        password: createCommonUserDto.password,
        confirmPassword: createCommonUserDto.confirmPassword,
      },
      user,
    );

    user.username = createCommonUserDto.username;

    await this.commonUserRepository.save(user);

    return {
      id: user.id,
    };
  }

  async update() {}

  async delete(id: string) {
    return await this.commonUserRepository.delete(id);
  }
}
