import { Exclude, Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
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

  @IsOptional()
  @IsString({ message: 'O código da diretriz é do tipo string' })
  code?: string;

  @Exclude()
  image?: File;

  @IsOptional()
  @IsString({ message: 'A descrição da imagem da diretriz é do tipo string' })
  @MaxLength(250, {
    message: 'A descrição da imagem deve ter no máximo 250 caracteres',
  })
  imageDesc?: string;

  @Transform(({ value }) => {
    let newString = value.toString();

    newString = newString.replace('[', '');
    newString = newString.replace(']', '');
    newString = newString.replaceAll(`"`, '');

    return newString.split(',');
  })
  @IsArray({ message: 'As deficiências da diretriz são do tipo array' })
  @ArrayNotEmpty({
    message: 'A diretriz precisa ter ao menos uma deficiência relacionada',
  })
  @IsString({
    each: true,
    message: 'A deficiência é do tipo string',
  })
  deficiences: string[];
}
