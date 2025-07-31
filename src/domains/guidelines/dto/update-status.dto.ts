import { OmitType } from '@nestjs/mapped-types';
import { UpdateGuidelineDto } from './update-guideline.dto';

export class UpdateStatusDto extends OmitType(UpdateGuidelineDto, [
  'image',
  'code',
  'deficiences',
  'desc',
  'imageDesc',
  'name',
  'imageId',
] as const) {}
