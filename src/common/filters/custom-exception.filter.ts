import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { Response } from 'express';
import * as http from 'http';

@Catch(CustomException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: CustomException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusMessage =
      http.STATUS_CODES[
        exception.httpErrorCode || HttpStatus.INTERNAL_SERVER_ERROR
      ];

    response
      .status(exception.httpErrorCode || HttpStatus.INTERNAL_SERVER_ERROR)
      .json({
        statusCode: exception.httpErrorCode || HttpStatus.INTERNAL_SERVER_ERROR,
        message: statusMessage,
        errors: [
          {
            errorCode: exception.errorCode,
            message: exception.message,
            fields: exception.fields,
            httpErrorCode:
              exception.httpErrorCode || HttpStatus.INTERNAL_SERVER_ERROR,
          },
        ],
      });
  }
}
