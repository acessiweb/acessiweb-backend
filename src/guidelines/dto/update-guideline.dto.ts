import { OmitType } from '@nestjs/mapped-types';
import { CreateGuidelineDto } from './create-guideline.dto';
import { IsNotIn, IsOptional, IsString } from 'class-validator';

export class UpdateGuidelineDto extends OmitType(CreateGuidelineDto, [
  'userId',
] as const) {
  @IsString({ message: 'O código do status é do tipo string' })
  @IsNotIn(['APPROVED', 'PENDING', 'REJECTED', 'DELETED'])
  @IsOptional()
  statusCode: string;

  @IsString({ message: 'A mensagem do status é do tipo string' })
  @IsOptional()
  statusMsg: string;
}
