import { Module } from '@nestjs/common';
import { CommonUserController } from './common-users.controller';
import { CommonUserService } from './common-users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonUser } from './entities/common-user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CommonUsersRepository } from './common-users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CommonUser]), AuthModule],
  controllers: [CommonUserController],
  providers: [CommonUserService, CommonUsersRepository],
  exports: [CommonUserService, CommonUsersRepository],
})
export class CommonUserModule {}
