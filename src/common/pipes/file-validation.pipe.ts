import { PipeTransform, Injectable, HttpStatus } from '@nestjs/common';
import CustomException from '../exceptions/custom-exception.exception';
import { INVALID_EXTENSION, MAX_SIZE_EXCEEDED } from '../errors/errors-codes';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(value: {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
  }) {
    if (!value) return;

    const MAX_SIZE_ALLOWED = 5 * 1024 * 1024;

    if (value.size > MAX_SIZE_ALLOWED) {
      throw new CustomException(
        'Tamanho máximo permitido para imagem: 5MB',
        MAX_SIZE_EXCEEDED,
        [value.fieldname],
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!['image/png', 'image/jpeg'].includes(value.mimetype)) {
      throw new CustomException(
        'Extensões de imagem permitida: png, jpeg',
        INVALID_EXTENSION,
        [value.fieldname],
        HttpStatus.BAD_REQUEST,
      );
    }

    return value;
  }
}
