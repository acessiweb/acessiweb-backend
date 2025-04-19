import { Controller } from '@nestjs/common';
import { DeficiencesService } from './deficiences.service';

@Controller('deficiences')
export class DeficiencesController {
  constructor(private readonly deficiencesService: DeficiencesService) {}

  async findAll() {
    return await this.deficiencesService.findAll();
  }
}
