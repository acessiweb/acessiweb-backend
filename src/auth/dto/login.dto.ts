import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class LoginDto {
  @IsEmail(
    {},
    {
      message: 'Email inválido',
    },
  )
  @IsOptional()
  email: string;

  @IsMobilePhone('pt-BR', {}, { message: 'Número de celular inválido' })
  @IsOptional()
  mobilePhone: string;

  @IsNotEmpty({ message: 'Campo de senha é obrigatório' })
  password: string;
}
