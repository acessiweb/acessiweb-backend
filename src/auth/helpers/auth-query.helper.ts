import { Repository } from 'typeorm';
import { Auth } from '../entities/auth.entity';
import { CryptoService } from 'src/common/encription/crypto.service';
import { throwDuplicateEmailOrMobilePhone } from './auth-errors.helper';

export async function findByEmail(
  email: string,
  cryptoService: CryptoService,
  authRepository: Repository<Auth>,
): Promise<{ emailHash: string; auth: Auth }> {
  const emailHash = cryptoService.toHash(email);

  try {
    const auth = await authRepository.findOne({
      where: {
        active: true,
        emailHash,
      },
      relations: ['user'],
    });

    return {
      emailHash,
      auth,
    };
  } catch (e) {
    throwDuplicateEmailOrMobilePhone('email', 'email');
  }
}

export async function findByMobilePhone(
  mobilePhone: string,
  cryptoService: CryptoService,
  authRepository: Repository<Auth>,
): Promise<{ mobilePhoneHash: string; auth: Auth }> {
  const mobilePhoneHash = cryptoService.toHash(mobilePhone);

  try {
    const auth = await authRepository.findOne({
      where: {
        active: true,
        mobilePhoneHash,
      },
      relations: ['user'],
    });

    return {
      mobilePhoneHash,
      auth,
    };
  } catch (e) {
    throwDuplicateEmailOrMobilePhone('mobilePhone', 'número de celular');
  }
}
