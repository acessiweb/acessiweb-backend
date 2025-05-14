import { HttpStatus } from '@nestjs/common';

export default class CustomException {
  message: string;
  errorCode: string;
  fields: string[];
  httpErrorCode: HttpStatus;

  constructor(
    message: string,
    errorCode: string,
    fields?: string[],
    httpErrorCode?: HttpStatus,
  ) {
    this.message = message;
    this.errorCode = errorCode;
    this.fields = fields;
    this.httpErrorCode = httpErrorCode;
  }
}
