import { OmitType } from '@nestjs/mapped-types';
import { CreateGuidelineDto } from 'src/guidelines/dto/create-guideline.dto';

export class CreateUserGuidelineDto extends OmitType(CreateGuidelineDto, [
  'userId',
] as const) {}
