import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guideline } from './entities/guideline.entity';
import { GuidelinesController } from './guidelines.controller';
import { GuidelinesService } from './guidelines.service';
import { UsersModule } from 'src/users/users.module';
import { DeficiencesModule } from 'src/deficiences/deficiences.module';
import { GuidelinesRepository } from './guidelines.repository';
import { ImageKitModule } from 'src/imagekit/imagekit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Guideline]),
    UsersModule,
    DeficiencesModule,
    ImageKitModule,
  ],
  controllers: [GuidelinesController],
  providers: [GuidelinesService, GuidelinesRepository],
  exports: [GuidelinesService, GuidelinesRepository],
})
export class GuidelinesModule {}
