import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/domains/users/users.module';
import { DeficiencesModule } from 'src/domains/deficiences/deficiences.module';
import { ImageKitModule } from 'src/integrations/imagekit/imagekit.module';
import { Guideline } from '../guidelines/entities/guideline.entity';
import { GuidelinesRequestsController } from './guidelines-requests.controller';
import { GuidelinesService } from '../guidelines/guidelines.service';
import { GuidelinesRepository } from '../guidelines/guidelines.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Guideline]),
    UsersModule,
    DeficiencesModule,
    ImageKitModule,
  ],
  controllers: [GuidelinesRequestsController],
  providers: [GuidelinesService, GuidelinesRepository],
  exports: [GuidelinesService, GuidelinesRepository],
})
export class GuidelinesModule {}
