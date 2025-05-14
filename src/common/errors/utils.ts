import CustomException from 'src/exceptions/custom-exception.exception';
import { CustomHttpException } from 'src/exceptions/custom-http.exception';

export function throwHttpException(e: CustomException) {
  throw new CustomHttpException(
    [
      {
        code: e.errorCode,
        message: e.message,
        fields: e.fields,
      },
    ],
    e.httpErrorCode,
  );
}
