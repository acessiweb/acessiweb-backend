import { Injectable } from '@nestjs/common';
import { CreateCommonUserDto } from './dto/create-common-user.dto';
import { QueryFailedError, Repository } from 'typeorm';
import { CommonUser } from './entities/common-user.entity';
import { AuthService } from 'src/auth/auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import CustomException from 'src/exceptions/custom-exception.exception';
import { NOT_FOUND } from 'src/common/errors/errors-codes';

@Injectable()
export class CommonUserService {
  constructor(
    @InjectRepository(CommonUser)
    private readonly commonUserRepository: Repository<CommonUser>,
    private readonly authService: AuthService,
  ) {}

  async findOneBy(id: string) {
    try {
      const user = await this.commonUserRepository.findOneBy({ id });

      if (!user) {
        throw new CustomException('Usuário não encontrado', NOT_FOUND);
      }

      return user;
    } catch (e) {
      if (e instanceof QueryFailedError) {
        throw new CustomException('Usuário não encontrado', NOT_FOUND);
      }
    }
  }

  async create(createCommonUserDto: CreateCommonUserDto) {
    const user = new CommonUser();

    user.username = createCommonUserDto.username;

    await this.commonUserRepository.save(user);

    await this.authService.create(
      {
        email: createCommonUserDto.email,
        mobilePhone: createCommonUserDto.mobilePhone,
        password: createCommonUserDto.password,
        confirmPassword: createCommonUserDto.confirmPassword,
      },
      user,
    );

    return {
      id: user.id,
    };
  }
}
