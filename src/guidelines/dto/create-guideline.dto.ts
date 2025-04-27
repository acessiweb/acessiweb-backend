import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateGuidelineDto {
  @IsString({ message: 'O nome da diretriz é do tipo string' })
  @MaxLength(150, { message: 'O nome deve ter no máximo 150 caracteres' })
  @IsNotEmpty({ message: 'É necessário informar um nome' })
  name: string;

  @IsString({ message: 'A descrição da diretriz é do tipo string' })
  @IsNotEmpty({ message: 'É necessário informar uma descrição' })
  desc: string;

  @IsString({ message: 'O código da diretriz é do tipo string' })
  @IsOptional()
  code: string;

  @IsString({ message: 'A imagem da diretriz é do tipo string' })
  @MaxLength(500, { message: 'A imagem deve ter no máximo 500 caracteres' })
  @IsOptional()
  image: string;

  @IsString({ message: 'A descrição da imagem da diretriz é do tipo string' })
  @MaxLength(250, {
    message: 'A descrição da imagem deve ter no máximo 250 caracteres',
  })
  @IsOptional()
  imageDesc: string;

  @IsArray({ message: 'As deficiências da diretriz são do tipo array' })
  @ArrayNotEmpty({
    message: 'A diretriz precisa ter ao menos uma deficiência relacionada',
  })
  @IsUUID(4, {
    each: true,
    message: 'A deficiência é do tipo UUID',
  })
  deficiences: string[];

  @IsUUID(4, { message: 'O usuário da diretriz é do tipo UUID' })
  @IsNotEmpty({ message: 'A diretriz precisa ter um usuário relacionado' })
  userId: string;
}
