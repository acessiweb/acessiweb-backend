import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { Response } from 'express';
import { isArray, ValidationError } from 'class-validator';
import {
  INVALID_DATA,
  INVALID_TYPE,
  MAX_LENGTH_EXCEEDED,
  REQUIRED_FIELD,
} from '../constants/errors';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const errorResponse = exception.getResponse() as {
      message: ValidationError[] | string;
      error: string;
      statusCode: number;
    };

    if (errorResponse.message === 'Validation failed (uuid is expected)') {
      response.status(400).json({
        statusCode: 400,
        message: 'Validation failed',
        errors: [
          new CustomException(
            'O id é do tipo UUID',
            INVALID_TYPE,
            [],
            HttpStatus.BAD_REQUEST,
          ),
        ],
      });
    }

    if (isArray(errorResponse.message)) {
      const validationErrors = [] as CustomException[];

      errorResponse.message.map((err: ValidationError) => {
        const msgsCodes = Object.entries(err.constraints!);

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
          } else if (key === 'matches' || key === 'isEmail') {
            validationErrors.push(
              new CustomException(value, INVALID_DATA, [err.property]),
            );
          }
        }
      });

      response.status(400).json({
        statusCode: 400,
        message: 'Validation failed',
        errors: validationErrors,
      });
    }
  }
}
