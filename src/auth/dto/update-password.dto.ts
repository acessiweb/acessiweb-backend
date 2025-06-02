import { IsNotEmpty, Matches } from 'class-validator';
import { PASSWORD_MASK, PASSWORD_VALIDATION_MSG } from '../auth.constants';

export class UpdatePasswordDto {
  @Matches(PASSWORD_MASK, {
    message: PASSWORD_VALIDATION_MSG,
  })
  @IsNotEmpty({ message: '' })
  oldPassword: string;

  @Matches(PASSWORD_MASK, {
    message: PASSWORD_VALIDATION_MSG,
  })
  @IsNotEmpty({ message: '' })
  newPassword: string;

  @Matches(PASSWORD_MASK, {
    message: PASSWORD_VALIDATION_MSG,
  })
  @IsNotEmpty({ message: '' })
  confirmNewPassword: string;
}
