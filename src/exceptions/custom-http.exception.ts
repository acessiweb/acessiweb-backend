import { HttpException, HttpStatus } from '@nestjs/common';

interface FieldError {
  code: string;
  message: string;
}

export class CustomHttpException extends HttpException {
  constructor(
    errors: FieldError[],
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        statusCode: status,
        errors,
      },
      status,
    );
  }
}
