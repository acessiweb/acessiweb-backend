import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guideline } from './entities/guideline.entity';
import { GuidelinesController } from './guidelines.controller';
import { GuidelinesService } from './guidelines.service';
import { UsersModule } from 'src/domains/users/users.module';
import { DeficiencesModule } from 'src/domains/deficiences/deficiences.module';
import { GuidelinesRepository } from './guidelines.repository';
import { ImageKitModule } from 'src/integrations/imagekit/imagekit.module';
import { FilterRepository } from 'src/common/repositories/filter.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Guideline]),
    UsersModule,
    DeficiencesModule,
    ImageKitModule,
  ],
  controllers: [GuidelinesController],
  providers: [GuidelinesService, GuidelinesRepository, FilterRepository],
  exports: [GuidelinesService, GuidelinesRepository],
})
export class GuidelinesModule {}
