import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';
import { PASSWORD_MASK, PASSWORD_VALIDATION_MSG } from '../auth.constants';

export class CreateAuthDto {
  @IsEmail(
    {},
    {
      message: 'Email inválido',
    },
  )
  @MaxLength(512, { message: 'Email deve possuir no máximo 512 caracteres' })
  @IsOptional()
  email: string;

  @IsMobilePhone('pt-BR', {}, { message: 'Número de celular inválido' })
  @IsOptional()
  mobilePhone: string;

  @Matches(PASSWORD_MASK, {
    message: PASSWORD_VALIDATION_MSG,
  })
  @IsNotEmpty({ message: 'É necessário enviar uma senha de acesso' })
  password: string;

  @Matches(PASSWORD_MASK, {
    message: PASSWORD_VALIDATION_MSG,
  })
  @IsNotEmpty({ message: 'É necessário enviar a confirmação da senha' })
  confirmPassword: string;
}
