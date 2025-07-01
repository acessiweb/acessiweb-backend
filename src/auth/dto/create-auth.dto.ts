import {
  IsEmail,
  IsMobilePhone,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';
import { PASSWORD_MASK, PASSWORD_VALIDATION_MSG } from '../auth.constants';

export class CreateAuthDto {
  @IsOptional()
  @IsEmail(
    {},
    {
      message: 'Email inválido',
    },
  )
  @MaxLength(512, { message: 'Email deve possuir no máximo 512 caracteres' })
  email?: string;

  @IsOptional()
  @IsMobilePhone('pt-BR', {}, { message: 'Número de celular inválido' })
  mobilePhone?: string;

  @IsOptional()
  @Matches(PASSWORD_MASK, {
    message: PASSWORD_VALIDATION_MSG,
  })
  password: string;

  @IsOptional()
  @Matches(PASSWORD_MASK, {
    message: PASSWORD_VALIDATION_MSG,
  })
  confirmPassword: string;
}
