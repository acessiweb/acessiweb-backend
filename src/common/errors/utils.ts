import CustomException from 'src/common/exceptions/custom-exception.exception';
import { CustomHttpException } from 'src/common/exceptions/custom-http.exception';

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
