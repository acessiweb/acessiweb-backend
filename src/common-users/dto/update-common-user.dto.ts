import { OmitType } from '@nestjs/mapped-types';
import { CreateCommonUserDto } from './create-common-user.dto';

export class UpdateProjectDto extends OmitType(CreateCommonUserDto, [
  'email',
  'confirmPassword',
  'mobilePhone',
  'password',
] as const) {}
