import { OmitType } from '@nestjs/mapped-types';
import { UpdateGuidelineDto } from './update-guideline.dto';
import { IsNotIn, IsOptional, IsString } from 'class-validator';
import { GuidelineStatus } from 'src/common/constants/guideline-status';
import { GuidelineStatus as GuidelineStatusType } from 'src/types/guideline';

export class UpdateStatusDto extends OmitType(UpdateGuidelineDto, [
  'image',
  'code',
  'deficiences',
  'desc',
  'imageDesc',
  'name',
  'imageId',
] as const) {
  @IsString({ message: 'O código do status é do tipo string' })
  @IsNotIn(GuidelineStatus)
  @IsOptional()
  statusCode?: GuidelineStatusType;

  @IsString({ message: 'A mensagem do status é do tipo string' })
  @IsOptional()
  statusMsg?: string;
}
