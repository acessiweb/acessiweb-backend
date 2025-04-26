import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import CustomException from 'src/exceptions/custom-exception.exception';
import { Response } from 'express';
import { INVALID_TYPE, REQUIRED_FIELD } from 'src/common/errors/errors-codes';
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

    const errors = errorResponse.message.map((err: ValidationError) => {
      const msgsCodes = Object.entries(err.constraints);

      console.log(msgsCodes);

      for (let [key, value] of msgsCodes) {
        if (key === 'isNotEmpty') {
          return new CustomException(value, REQUIRED_FIELD);
        } else if (key === 'isEmail' || key === 'isString') {
          return new CustomException(value, INVALID_TYPE);
        }
      }
    });

    response.status(400).json({
      statusCode: 400,
      message: 'Validation failed',
      errors,
    });
  }
}
