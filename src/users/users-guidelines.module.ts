import { Module } from '@nestjs/common';
import { GuidelinesModule } from 'src/guidelines/guidelines.module';
import { UsersModule } from './users.module';
import { UserGuidelinesController } from './users-guidelines.controller';

@Module({
  imports: [GuidelinesModule, UsersModule],
  controllers: [UserGuidelinesController],
})
export class UsersGuidelinesModule {}
