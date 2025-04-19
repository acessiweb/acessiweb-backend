import { Module } from '@nestjs/common';
import { DeficiencesController } from './deficiences.controller';
import { DeficiencesService } from './deficiences.service';
import { Deficiency } from './entities/deficiences.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Deficiency])],
  controllers: [DeficiencesController],
  providers: [DeficiencesService],
  exports: [DeficiencesService],
})
export class DeficiencesModule {}
