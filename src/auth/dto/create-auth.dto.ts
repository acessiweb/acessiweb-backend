import {
  IsEmail,
  IsMobilePhone,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';
import { PASSWORD_MASK, PASSWORD_VALIDATION_MSG } from '../auth.constants';
import { Transform } from 'class-transformer';

export class CreateAuthDto {
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsEmail(
    {},
    {
      message: 'Email inválido',
    },
  )
  @MaxLength(512, { message: 'Email deve possuir no máximo 512 caracteres' })
  email?: string;

  @Transform(({ value }) => (value === '' ? undefined : value))
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
