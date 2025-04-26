import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';
import { PASSWORD_MASK } from 'src/common/masks/masks';

export class CreateAuthDto {
  @IsEmail(
    {},
    {
      message: 'Email inválido',
    },
  )
  @MaxLength(512)
  @IsOptional()
  email: string;

  @IsMobilePhone('pt-BR')
  @IsOptional()
  mobilePhone: string;

  @Matches(PASSWORD_MASK, {
    message:
      'A senha precisa ter no mínimo 8 caracteres. No máximo 16 caracteres. Pelo menos uma letra maíuscula. Pelo menos um símbolo dentre os quais: @, #, *, ^, &, !, %. E pelo menos 2 caracteres numéricos',
  })
  @IsNotEmpty()
  password: string;

  @Matches(PASSWORD_MASK, {
    message:
      'A senha precisa ter no mínimo 8 caracteres. No máximo 16 caracteres. Pelo menos uma letra maíuscula. Pelo menos um símbolo dentre os quais: @, #, *, ^, &, !, %. E pelo menos 2 caracteres numéricos',
  })
  @IsNotEmpty()
  confirmPassword: string;
}
