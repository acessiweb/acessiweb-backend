import { OmitType } from '@nestjs/mapped-types';
import { CreateCommonUserDto } from './create-common-user.dto';

export class UpdateCommonUserDto extends OmitType(CreateCommonUserDto, [
  'email',
  'confirmPassword',
  'mobilePhone',
  'password',
] as const) {}
