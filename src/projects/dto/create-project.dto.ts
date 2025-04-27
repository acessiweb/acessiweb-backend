import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateProjectDto {
  @IsString({ message: 'O nome do projeto é do tipo string' })
  @MaxLength(150, { message: 'O nome deve ter no máximo 150 caracteres' })
  @IsNotEmpty({ message: 'É necessário informar um nome' })
  name: string;

  @IsString({ message: 'A descrição do projeto é do tipo string' })
  @IsOptional()
  desc: string;

  @IsArray({ message: 'As diretrizes do projeto são do tipo array' })
  @ArrayNotEmpty({
    message: 'O projeto precisa ter pelo menos uma diretriz relacionada',
  })
  @IsUUID(4, { each: true, message: 'A diretriz é do tipo UUID' })
  guidelines: string[];

  @IsUUID(4, { message: 'O usuário do projeto é do tipo UUID' })
  @IsNotEmpty({
    message: 'O projeto precisa ter um usuário relacionado',
  })
  userId: string;
}
