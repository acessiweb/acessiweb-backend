import { Global, Module } from '@nestjs/common';
import { CryptoService } from 'src/common/encription/crypto.service';
import { HashingService } from './auth/hashing/hashing.service';
import { BcryptService } from './auth/hashing/bcrypt.service';
import { Init } from './init';

@Global()
@Module({
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    CryptoService,
    Init,
  ],
  exports: [HashingService],
})
export class InitModule {}
