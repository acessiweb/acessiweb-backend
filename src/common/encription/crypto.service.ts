import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  scryptSync,
} from 'crypto';

export class CryptoService {
  hash = createHash('sha256');
  algorithm = 'aes-256-cbc';
  keyLength = 32;
  ivLength = 16;

  toHash(value: string) {
    const hashCopy = this.hash.copy();
    return hashCopy.update(value.trim().toLowerCase()).digest('base64');
  }

  encrypt(value: string) {
    const iv = randomBytes(this.ivLength);
    const key = scryptSync(process.env.CRYPTO_PASSWORD, 'salt', this.keyLength);

    const cipher = createCipheriv(this.algorithm, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);

    return `${iv.toString('base64')}:${encrypted.toString('base64')}`;
  }

  decrypt(value: string) {
    const [ivBase64, encryptedBase64] = value.split(':');
    const iv = Buffer.from(ivBase64, 'base64');
    const content = Buffer.from(encryptedBase64, 'base64');
    const key = scryptSync(process.env.CRYPTO_PASSWORD, 'salt', this.keyLength);

    const decipher = createDecipheriv(this.algorithm, key, iv);
    const decrypted = Buffer.concat([
      decipher.update(content),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }
}
