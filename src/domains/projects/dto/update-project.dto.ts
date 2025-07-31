import { CreateProjectDto } from './create-project.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProjectDto extends CreateProjectDto {
  @IsOptional()
  @IsString({ message: 'O feedback do projeto é do tipo string' })
  feedback: string;
}
