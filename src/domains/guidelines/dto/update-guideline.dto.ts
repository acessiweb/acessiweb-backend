import { CreateGuidelineDto } from './create-guideline.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateGuidelineDto extends CreateGuidelineDto {
  @IsString()
  @IsOptional()
  imageId?: string;
}
