import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { CreateAuthDto } from 'src/services/auth/dto/create-auth.dto';

export class CreateCommonUserDto extends CreateAuthDto {
  @IsString({ message: 'O nome de usuário é do tipo string' })
  @IsNotEmpty({ message: 'É necessário informar um nome de usuário' })
  @MaxLength(30, { message: 'O nome deve ter no máximo 30 caracteres' })
  @Matches(/^[A-Za-z0-9]+( [A-Za-z0-9]+)*$/, {
    message: 'É permitido somente letras e números no nome de usuário',
  })
  username: string;
}
