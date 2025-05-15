import { HttpStatus } from '@nestjs/common';
import {
  DATA_NOT_MATCH,
  DUPLICATE_DATA,
  INVALID_DATA,
  REQUIRED_FIELD,
} from 'src/common/errors/errors-codes';
import CustomException from 'src/common/exceptions/custom-exception.exception';

export function throwEmailOrMobilePhoneEmpty() {
  throw new CustomException(
    'Email ou número de celular precisa ser informado',
    REQUIRED_FIELD,
    ['email', 'mobilePhone'],
    HttpStatus.BAD_REQUEST,
  );
}

export function throwDuplicateEmailOrMobilePhone(
  field: string,
  fieldTranslate: string,
) {
  throw new CustomException(
    `Esse ${fieldTranslate} já está sendo utilizado`,
    DUPLICATE_DATA,
    [field],
    HttpStatus.CONFLICT,
  );
}

export function throwPasswordsMismatch(fields: string[]) {
  throw new CustomException(
    'As senhas não conferem',
    DATA_NOT_MATCH,
    [...fields],
    HttpStatus.CONFLICT,
  );
}

export function throwInvalidLogin(field: string, fieldTranslate: string) {
  throw new CustomException(
    `${fieldTranslate} ou senha inválidos`,
    INVALID_DATA,
    [field, 'password'],
    HttpStatus.BAD_REQUEST,
  );
}
