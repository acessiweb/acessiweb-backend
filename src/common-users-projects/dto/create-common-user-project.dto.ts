import { OmitType } from '@nestjs/mapped-types';
import { CreateProjectDto } from 'src/projects/dto/create-project.dto';

export class CreateCommonUserProjectDto extends OmitType(CreateProjectDto, [
  'userId',
] as const) {}
