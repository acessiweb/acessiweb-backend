import { OmitType } from '@nestjs/mapped-types';
import { CreateAuthDto } from 'src/auth/dto/create-auth.dto';

export class CreateAdminUserDto extends OmitType(CreateAuthDto, [
  'confirmPassword',
  'mobilePhone',
] as const) {}
