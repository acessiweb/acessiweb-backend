import { Injectable, Inject } from '@nestjs/common';
import ImageKit from 'imagekit';
import IKResponse from 'imagekit/dist/libs/interfaces/IKResponse';
import { UploadResponse } from 'imagekit/dist/libs/interfaces';

@Injectable()
export class ImageKitService {
  constructor(
    @Inject('IMAGEKIT_SERVICE') private readonly imageKit: ImageKit,
  ) {}

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<IKResponse<UploadResponse>> {
    return await this.imageKit.upload({
      file: file.buffer,
      fileName: file.originalname,
      folder: `/acessiweb/${folder}`,
    });
  }

  async deleteImage(fileId: string): Promise<IKResponse<void>> {
    return await this.imageKit.deleteFile(fileId);
  }

  getImageUrl(path: string, transformations?: any[]) {
    return this.imageKit.url({
      path,
      transformation: transformations,
    });
  }
}
