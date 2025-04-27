import { OmitType } from '@nestjs/mapped-types';
import { CreateGuidelineDto } from './create-guideline.dto';

export class UpdateGuidelineDto extends OmitType(CreateGuidelineDto, [
  'userId',
] as const) {}
