import { Injectable, OnModuleInit } from '@nestjs/common';
// import { CryptoService } from './common/encription/crypto.service';
// import { HashingService } from './auth/hashing/hashing.service';

@Injectable()
export class Init implements OnModuleInit {
  constructor() // private readonly hashingService: HashingService, // private readonly cryptoService: CryptoService,
  {}

  async onModuleInit() {
    // const encrypted = this.cryptoService.encrypt('admin@acessiweb.com.br');
    // const hashed = this.cryptoService.toHash('admin@acessiweb.com.br');
    // const hashedPass = await this.hashingService.hash('sdab3&@7djksSf');
  }
}
