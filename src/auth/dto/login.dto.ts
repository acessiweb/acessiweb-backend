import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class LoginDto {
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsEmail(
    {},
    {
      message: 'Email inválido',
    },
  )
  email?: string;

  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsMobilePhone('pt-BR', {}, { message: 'Número de celular inválido' })
  mobilePhone?: string;

  @IsNotEmpty({ message: 'Campo de senha é obrigatório' })
  password: string;
}
