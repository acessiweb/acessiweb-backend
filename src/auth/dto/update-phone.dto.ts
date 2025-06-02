import { OmitType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create-auth.dto';

export class UpdateMobilePhoneDto extends OmitType(CreateAuthDto, [
  'password',
  'confirmPassword',
  'email',
] as const) {}
