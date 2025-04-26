import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CreateAuthDto } from 'src/auth/dto/create-auth.dto';

export class CreateCommonUserDto extends CreateAuthDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username: string;
}
