import { OmitType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProjectDto extends OmitType(CreateProjectDto, [
  'userId',
] as const) {
  @IsOptional()
  @IsString({ message: 'O feedback do projeto é do tipo string' })
  feedback: string;
}
