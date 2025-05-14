import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { Response } from 'express';
import {
  INVALID_DATA,
  INVALID_TYPE,
  MAX_LENGTH_EXCEEDED,
  REQUIRED_FIELD,
} from 'src/common/errors/errors-codes';
import { ValidationError } from 'class-validator';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorResponse = exception.getResponse() as {
      message: ValidationError[];
      error: string;
      statusCode: number;
    };

    const validationErrors = [];

    errorResponse.message.map((err: ValidationError) => {
      const msgsCodes = Object.entries(err.constraints);

      console.log(msgsCodes);

      for (let [key, value] of msgsCodes) {
        if (key === 'isNotEmpty') {
          validationErrors.push(
            new CustomException(value, REQUIRED_FIELD, [err.property]),
          );
        } else if (key === 'isString') {
          validationErrors.push(
            new CustomException(value, INVALID_TYPE, [err.property]),
          );
        } else if (key === 'maxLength') {
          validationErrors.push(
            new CustomException(value, MAX_LENGTH_EXCEEDED, [err.property]),
          );
        } else if (key === 'matches') {
          validationErrors.push(
            new CustomException(value, INVALID_DATA, [err.property]),
          );
        }
      }
    });

    response.status(400).json({
      statusCode: 400,
      message: 'Validation failed',
      validationErrors,
    });
  }
}
