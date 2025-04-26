import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guideline } from './entities/guideline.entity';
import { GuidelinesController } from './guidelines.controller';
import { GuidelinesService } from './guidelines.service';
import { UsersModule } from 'src/users/users.module';
import { DeficiencesModule } from 'src/deficiences/deficiences.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Guideline]),
    UsersModule,
    DeficiencesModule,
  ],
  controllers: [GuidelinesController],
  providers: [GuidelinesService],
  exports: [GuidelinesService],
})
export class GuidelinesModule {}
