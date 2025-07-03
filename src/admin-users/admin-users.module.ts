import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AdminUser } from './entities/admin-user.entity';
import { AdminUserService } from './admin-users.service';
import { AdminUserController } from './admin-users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AdminUser]), AuthModule],
  controllers: [AdminUserController],
  providers: [AdminUserService],
  exports: [AdminUserService],
})
export class AdminUserModule {}
