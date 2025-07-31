import { OmitType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create-auth.dto';

export class UpdateEmailDto extends OmitType(CreateAuthDto, [
  'password',
  'confirmPassword',
  'mobilePhone',
] as const) {}
