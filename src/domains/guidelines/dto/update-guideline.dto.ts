import { GuidelineStatus } from 'src/common/constants/guideline-status';
import { CreateGuidelineDto } from './create-guideline.dto';
import { IsNotIn, IsOptional, IsString } from 'class-validator';
import { GuidelineStatus as GuidelineStatusType } from 'src/types/guideline';

export class UpdateGuidelineDto extends CreateGuidelineDto {
  @IsString({ message: 'O código do status é do tipo string' })
  @IsNotIn(GuidelineStatus)
  @IsOptional()
  statusCode?: GuidelineStatusType;

  @IsString({ message: 'A mensagem do status é do tipo string' })
  @IsOptional()
  statusMsg?: string;

  @IsString()
  @IsOptional()
  imageId?: string;
}
