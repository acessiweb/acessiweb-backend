import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import imagekitConfig from './config/imagekit.config';
import { ImageKitService } from './imagekit.service';
import ImageKit from 'imagekit';

@Module({
  imports: [ConfigModule.forFeature(imagekitConfig)],
  providers: [
    {
      provide: 'IMAGEKIT_SERVICE',
      useFactory: (configService: ConfigService) => {
        return new ImageKit({
          publicKey: configService.get<string>('imagekit.publicKey')!,
          privateKey: configService.get<string>('imagekit.privateKey')!,
          urlEndpoint: configService.get<string>('imagekit.urlEndpoint')!,
        });
      },
      inject: [ConfigService],
    },
    ImageKitService,
  ],
  exports: [ImageKitService],
})
export class ImageKitModule {}
