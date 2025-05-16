import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create-auth.dto';
import { IsOptional, Matches } from 'class-validator';
import { PASSWORD_MASK, PASSWORD_VALIDATION_MSG } from '../auth.constants';

export class UpdateAuthDto extends PartialType(
  OmitType(CreateAuthDto, ['password', 'confirmPassword'] as const),
) {
  @Matches(PASSWORD_MASK, {
    message: PASSWORD_VALIDATION_MSG,
  })
  @IsOptional()
  oldPassword: string;

  @Matches(PASSWORD_MASK, {
    message: PASSWORD_VALIDATION_MSG,
  })
  @IsOptional()
  newPassword: string;

  @Matches(PASSWORD_MASK, {
    message: PASSWORD_VALIDATION_MSG,
  })
  @IsOptional()
  confirmNewPassword: string;
}
