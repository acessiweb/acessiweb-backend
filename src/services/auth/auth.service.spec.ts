import { AuthService } from 'src/services/auth/auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import CustomException from 'src/common/exceptions/custom-exception.exception';
import { Repository } from 'typeorm';
import {
  DATA_NOT_MATCH,
  INVALID_DATA,
  REQUIRED_FIELD,
  UNAUTHORIZED,
  UPDATE_OPERATION_FAILED,
} from 'src/common/constants/errors';
import { Auth } from './entities/auth.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HashingService } from './hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { commonUsersMock } from 'test/__mocks__/common-users.service.mock';
import { HttpStatus } from '@nestjs/common';
import jwtConfig from './config/jwt.config';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdateMobilePhoneDto } from './dto/update-phone.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { TokenPayloadDto } from './dto/token-payload.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CryptoService } from '../crypto/crypto.service';

describe('AuthService (unit)', () => {
  let service: AuthService;
  let cryptoService: CryptoService;
  let repo: Repository<Auth>;
  let hashingService: HashingService;
  let jwtService: JwtService;

  const mockJwtConfig = {
    secret: 'secret',
    audience: 'audience',
    issuer: 'issuer',
    jwtTtl: 3600,
    jwtRefreshTtl: 86400,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Auth),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              update: jest.fn().mockReturnThis(),
              set: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              returning: jest.fn().mockReturnThis(),
              execute: jest.fn().mockReturnThis(),
            }),
            update: jest.fn(),
          },
        },
        {
          provide: CryptoService,
          useValue: {
            toHash: jest.fn(),
            encrypt: jest.fn(),
            decrypt: jest.fn(),
          },
        },
        {
          provide: HashingService,
          useValue: {
            hash: jest.fn(),
            compare: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: jwtConfig.KEY,
          useValue: mockJwtConfig,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repo = module.get<Repository<Auth>>(getRepositoryToken(Auth));
    cryptoService = module.get<CryptoService>(CryptoService);
    hashingService = module.get<HashingService>(HashingService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should throw Custom Exception if email and mobile phone are empty', async () => {
      const createAuthDto = new CreateAuthDto();
      createAuthDto.password = 'Laura@testes1';
      createAuthDto.confirmPassword = 'Laura@testes1';
      createAuthDto.email = '';
      createAuthDto.mobilePhone = '';

      const exception = new CustomException(
        'Email ou número de celular precisa ser informado',
        REQUIRED_FIELD,
        ['email', 'mobilePhone'],
        HttpStatus.BAD_REQUEST,
      );

      try {
        await service.create(createAuthDto, commonUsersMock[0]);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(exception.message);
        expect(e.fields).toEqual(exception.fields);
        expect(e.errorCode).toBe(exception.errorCode);
        expect(e.httpErrorCode).toBe(exception.httpErrorCode);
      }
    });

    it('should throw Custom Exception if passwords mismatch', async () => {
      const createAuthDto = new CreateAuthDto();
      createAuthDto.password = 'Laura@testes1';
      createAuthDto.confirmPassword = 'Laura@testes12';
      createAuthDto.email = 'lau@mail.com';
      createAuthDto.mobilePhone = '';

      const exception = new CustomException(
        'As senhas não conferem',
        DATA_NOT_MATCH,
        ['password', 'confirmPassword'],
        HttpStatus.CONFLICT,
      );

      try {
        await service.create(createAuthDto, commonUsersMock[0]);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(exception.message);
        expect(e.fields).toEqual(exception.fields);
        expect(e.errorCode).toBe(exception.errorCode);
        expect(e.httpErrorCode).toBe(exception.httpErrorCode);
      }
    });

    it('should return auth with email if email informed', async () => {
      const createAuthDto = new CreateAuthDto();
      createAuthDto.password = 'Laura@testes1';
      createAuthDto.confirmPassword = 'Laura@testes1';
      createAuthDto.email = 'lau@mail.com';
      createAuthDto.mobilePhone = '';

      jest.spyOn(cryptoService, 'toHash').mockReturnValue('HASHED_EMAIL');
      jest.spyOn(cryptoService, 'encrypt').mockReturnValue('ENCRYPTED_EMAIL');
      jest.spyOn(hashingService, 'hash').mockResolvedValue('HASHED_PASSWORD');

      const auth = await service.create(createAuthDto, commonUsersMock[0]);

      expect(auth.mobilePhone).not.toBeDefined();
      expect(auth.mobilePhoneHash).not.toBeDefined();
      expect(auth.email).toBeDefined();
      expect(auth.emailHash).toBeDefined();
      expect(auth.password).toBeDefined();
      expect(auth.user).toBeDefined();
      expect(auth.user.id).toBe(commonUsersMock[0].id);
      expect(auth.email).toBe('ENCRYPTED_EMAIL');
      expect(auth.emailHash).toBe('HASHED_EMAIL');
      expect(auth.password).toBe('HASHED_PASSWORD');
      expect(cryptoService.toHash).toHaveBeenCalledWith(createAuthDto.email);
      expect(cryptoService.encrypt).toHaveBeenCalledWith(createAuthDto.email);
      expect(hashingService.hash).toHaveBeenCalledWith(createAuthDto.password);
    });

    it('should return auth with mobile phone if mobile phone informed', async () => {
      const createAuthDto = new CreateAuthDto();
      createAuthDto.password = 'Laura@testes1';
      createAuthDto.confirmPassword = 'Laura@testes1';
      createAuthDto.email = '';
      createAuthDto.mobilePhone = '4563456456456';

      jest
        .spyOn(cryptoService, 'toHash')
        .mockReturnValue('HASHED_MOBILE_PHONE');
      jest
        .spyOn(cryptoService, 'encrypt')
        .mockReturnValue('ENCRYPTED_MOBILE_PHONE');
      jest.spyOn(hashingService, 'hash').mockResolvedValue('HASHED_PASSWORD');

      const auth = await service.create(createAuthDto, commonUsersMock[0]);

      expect(auth.mobilePhone).toBeDefined();
      expect(auth.mobilePhoneHash).toBeDefined();
      expect(auth.email).not.toBeDefined();
      expect(auth.emailHash).not.toBeDefined();
      expect(auth.password).toBeDefined();
      expect(auth.user).toBeDefined();
      expect(auth.user.id).toBe(commonUsersMock[0].id);
      expect(auth.mobilePhone).toBe('ENCRYPTED_MOBILE_PHONE');
      expect(auth.mobilePhoneHash).toBe('HASHED_MOBILE_PHONE');
      expect(auth.password).toBe('HASHED_PASSWORD');
      expect(cryptoService.toHash).toHaveBeenCalledWith(
        createAuthDto.mobilePhone,
      );
      expect(cryptoService.encrypt).toHaveBeenCalledWith(
        createAuthDto.mobilePhone,
      );
      expect(hashingService.hash).toHaveBeenCalledWith(createAuthDto.password);
    });
  });

  describe('update()', () => {
    it('should return email if email updated', async () => {
      const updateEmailDto = new UpdateEmailDto();
      updateEmailDto.email = 'teste@mail.com';

      jest.spyOn(cryptoService, 'toHash').mockReturnValue('EMAIL_HASH');
      jest.spyOn(cryptoService, 'encrypt').mockReturnValue('EMAIL_ENCRYPT');
      jest
        .spyOn(cryptoService, 'decrypt')
        .mockReturnValue(updateEmailDto.email);
      jest.spyOn(service, 'findOne').mockResolvedValue({
        id: 'auth-id',
      } as Auth);

      jest.spyOn(repo, 'createQueryBuilder').mockReturnValue({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          raw: [{ email: 'EMAIL_ENCRYPT' }],
          generatedMaps: [],
          affected: 1,
        }),
      } as any);

      const emailUpdated = await service.updateEmail(updateEmailDto);
      expect(emailUpdated).toEqual({
        email: updateEmailDto.email,
      });
      expect(service.findOne).toHaveBeenCalledWith({
        email: updateEmailDto.email,
      });
      expect(cryptoService.toHash).toHaveBeenCalledWith(updateEmailDto.email);
      expect(cryptoService.encrypt).toHaveBeenCalledWith(updateEmailDto.email);
      expect(cryptoService.decrypt).toHaveBeenCalledWith('EMAIL_ENCRYPT');
    });

    it('should throw Custom Exception if auth not found', async () => {
      const updateEmailDto = new UpdateEmailDto();
      updateEmailDto.email = 'teste@mail.com';

      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      const exception = new CustomException(
        'Não foi possível atualizar o email',
        UNAUTHORIZED,
        [],
        HttpStatus.UNAUTHORIZED,
      );

      try {
        await service.updateEmail(updateEmailDto);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(exception.message);
        expect(e.errorCode).toBe(exception.errorCode);
        expect(e.fields).toEqual(exception.fields);
        expect(e.httpErrorCode).toBe(exception.httpErrorCode);
      }

      expect(service.findOne).toHaveBeenCalledWith({
        email: updateEmailDto.email,
      });
      expect(cryptoService.toHash).not.toHaveBeenCalled();
      expect(cryptoService.encrypt).not.toHaveBeenCalled();
      expect(repo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should throw Custom Exception if email not updated', async () => {
      const updateEmailDto = new UpdateEmailDto();
      updateEmailDto.email = 'teste@mail.com';

      jest.spyOn(cryptoService, 'toHash').mockReturnValue('EMAIL_HASH');
      jest.spyOn(cryptoService, 'encrypt').mockReturnValue('EMAIL_ENCRYPT');
      jest
        .spyOn(cryptoService, 'decrypt')
        .mockReturnValue(updateEmailDto.email);
      jest.spyOn(service, 'findOne').mockResolvedValue({
        id: 'auth-id',
      } as Auth);

      const exception = new CustomException(
        `Não foi possível atualizar email`,
        UPDATE_OPERATION_FAILED,
        ['email'],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      jest.spyOn(repo, 'createQueryBuilder').mockReturnValue({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          raw: [],
          generatedMaps: [],
          affected: 0,
        }),
      } as any);

      try {
        await service.updateEmail(updateEmailDto);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(exception.message);
        expect(e.errorCode).toBe(exception.errorCode);
        expect(e.fields).toEqual(exception.fields);
        expect(e.httpErrorCode).toBe(exception.httpErrorCode);
      }

      expect(service.findOne).toHaveBeenCalledWith({
        email: updateEmailDto.email,
      });
      expect(cryptoService.toHash).toHaveBeenCalledWith(updateEmailDto.email);
      expect(cryptoService.encrypt).toHaveBeenCalledWith(updateEmailDto.email);
    });

    it('should return mobile phone if mobile phone updated', async () => {
      const updateMobilePhoneDto = new UpdateMobilePhoneDto();
      updateMobilePhoneDto.mobilePhone = '34234234234234';

      jest.spyOn(cryptoService, 'toHash').mockReturnValue('MOBILE_PHONE_HASH');
      jest
        .spyOn(cryptoService, 'encrypt')
        .mockReturnValue('MOBILE_PHONE_ENCRYPT');
      jest
        .spyOn(cryptoService, 'decrypt')
        .mockReturnValue(updateMobilePhoneDto.mobilePhone);
      jest.spyOn(service, 'findOne').mockResolvedValue({
        id: 'auth-id',
      } as Auth);

      jest.spyOn(repo, 'createQueryBuilder').mockReturnValue({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          raw: [{ mobilePhone: 'MOBILE_PHONE_ENCRYPT' }],
          generatedMaps: [],
          affected: 1,
        }),
      } as any);

      const mobilePhoneUpdated =
        await service.updateMobilePhone(updateMobilePhoneDto);
      expect(mobilePhoneUpdated).toEqual({
        mobilePhone: updateMobilePhoneDto.mobilePhone,
      });
      expect(service.findOne).toHaveBeenCalledWith({
        mobilePhone: updateMobilePhoneDto.mobilePhone,
      });
      expect(cryptoService.toHash).toHaveBeenCalledWith(
        updateMobilePhoneDto.mobilePhone,
      );
      expect(cryptoService.encrypt).toHaveBeenCalledWith(
        updateMobilePhoneDto.mobilePhone,
      );
      expect(cryptoService.decrypt).toHaveBeenCalledWith(
        'MOBILE_PHONE_ENCRYPT',
      );
    });

    it('should throw Custom Exception if auth not found', async () => {
      const updateMobilePhoneDto = new UpdateMobilePhoneDto();
      updateMobilePhoneDto.mobilePhone = '234234234234';

      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      const exception = new CustomException(
        'Não foi possível atualizar o celular',
        UNAUTHORIZED,
        [],
        HttpStatus.UNAUTHORIZED,
      );

      try {
        await service.updateMobilePhone(updateMobilePhoneDto);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(exception.message);
        expect(e.errorCode).toBe(exception.errorCode);
        expect(e.fields).toEqual(exception.fields);
        expect(e.httpErrorCode).toBe(exception.httpErrorCode);
      }

      expect(service.findOne).toHaveBeenCalledWith({
        mobilePhone: updateMobilePhoneDto.mobilePhone,
      });
      expect(cryptoService.toHash).not.toHaveBeenCalled();
      expect(cryptoService.encrypt).not.toHaveBeenCalled();
      expect(repo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should throw Custom Exception if mobile phone not updated', async () => {
      const updateMobilePhoneDto = new UpdateMobilePhoneDto();
      updateMobilePhoneDto.mobilePhone = '34234234234234';

      jest.spyOn(cryptoService, 'toHash').mockReturnValue('MOBILE_PHONE_HASH');
      jest
        .spyOn(cryptoService, 'encrypt')
        .mockReturnValue('MOBILE_PHONE_ENCRYPT');
      jest
        .spyOn(cryptoService, 'decrypt')
        .mockReturnValue(updateMobilePhoneDto.mobilePhone);
      jest.spyOn(service, 'findOne').mockResolvedValue({
        id: 'auth-id',
      } as Auth);

      jest.spyOn(repo, 'createQueryBuilder').mockReturnValue({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          raw: [],
          generatedMaps: [],
          affected: 0,
        }),
      } as any);

      const exception = new CustomException(
        `Não foi possível atualizar celular`,
        UPDATE_OPERATION_FAILED,
        ['mobilePhone'],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      try {
        await service.updateMobilePhone(updateMobilePhoneDto);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(exception.message);
        expect(e.errorCode).toBe(exception.errorCode);
        expect(e.fields).toEqual(exception.fields);
        expect(e.httpErrorCode).toBe(exception.httpErrorCode);
      }

      expect(service.findOne).toHaveBeenCalledWith({
        mobilePhone: updateMobilePhoneDto.mobilePhone,
      });
      expect(cryptoService.toHash).toHaveBeenCalledWith(
        updateMobilePhoneDto.mobilePhone,
      );
      expect(cryptoService.encrypt).toHaveBeenCalledWith(
        updateMobilePhoneDto.mobilePhone,
      );
    });

    it('should return success if password updated', async () => {
      const updatePasswordDto = new UpdatePasswordDto();
      updatePasswordDto.newPassword = 'senha_nova';
      updatePasswordDto.confirmNewPassword = 'senha_nova';
      updatePasswordDto.oldPassword = 'senha_antiga';

      const tokenPayloadDto = new TokenPayloadDto();
      tokenPayloadDto.email = 'lau@mail.com';

      const authMocked = {
        id: 'auth-id',
        password: 'senha_antiga',
      } as Auth;

      jest.spyOn(service, 'findOne').mockResolvedValue(authMocked);
      jest.spyOn(hashingService, 'compare').mockResolvedValue(true);
      jest.spyOn(hashingService, 'hash').mockResolvedValue('HASHED_PASSWORD');
      jest.spyOn(repo, 'update').mockResolvedValue({
        raw: [],
        generatedMaps: [],
        affected: 1,
      });

      const response = await service.updatePassword(
        tokenPayloadDto,
        updatePasswordDto,
      );
      expect(response).toEqual({ success: true });
      expect(service.findOne).toHaveBeenCalledWith({
        email: tokenPayloadDto.email,
        mobilePhone: tokenPayloadDto.mobilePhone,
      });
      expect(hashingService.compare).toHaveBeenCalledWith(
        updatePasswordDto.oldPassword,
        authMocked.password,
      );
      expect(hashingService.hash).toHaveBeenCalledWith(
        updatePasswordDto.newPassword,
      );
      expect(repo.update).toHaveBeenCalledWith(authMocked.id, {
        password: 'HASHED_PASSWORD',
      });
    });

    it('should throw Custom Exception if auth not found', async () => {
      const updatePasswordDto = new UpdatePasswordDto();
      updatePasswordDto.newPassword = 'senha_nova';
      updatePasswordDto.confirmNewPassword = 'senha_nova';
      updatePasswordDto.oldPassword = 'senha_antiga';

      const tokenPayloadDto = new TokenPayloadDto();
      tokenPayloadDto.email = 'lau@mail.com';

      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      const exception = new CustomException(
        'Não foi possível atualizar a senha',
        UNAUTHORIZED,
        [],
        HttpStatus.UNAUTHORIZED,
      );

      try {
        await service.updatePassword(tokenPayloadDto, updatePasswordDto);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(exception.message);
        expect(e.errorCode).toBe(exception.errorCode);
        expect(e.fields).toEqual(exception.fields);
        expect(e.httpErrorCode).toBe(exception.httpErrorCode);
      }

      expect(service.findOne).toHaveBeenCalledWith({
        email: tokenPayloadDto.email,
        mobilePhone: tokenPayloadDto.mobilePhone,
      });
      expect(hashingService.compare).not.toHaveBeenCalled();
      expect(hashingService.hash).not.toHaveBeenCalled();
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should throw Custom Exception if password not updated', async () => {
      const updatePasswordDto = new UpdatePasswordDto();
      updatePasswordDto.newPassword = 'senha_nova';
      updatePasswordDto.confirmNewPassword = 'senha_nova';
      updatePasswordDto.oldPassword = 'senha_antiga';

      const tokenPayloadDto = new TokenPayloadDto();
      tokenPayloadDto.email = 'lau@mail.com';

      const authMocked = {
        id: 'auth-id',
        password: 'senha_antiga',
      } as Auth;

      jest.spyOn(service, 'findOne').mockResolvedValue(authMocked);
      jest.spyOn(hashingService, 'compare').mockResolvedValue(true);
      jest.spyOn(hashingService, 'hash').mockResolvedValue('HASHED_PASSWORD');
      jest.spyOn(repo, 'update').mockResolvedValue({
        raw: [],
        generatedMaps: [],
        affected: 0,
      });

      const exception = new CustomException(
        `Não foi possível atualizar a senha`,
        UPDATE_OPERATION_FAILED,
        ['password'],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      try {
        await service.updatePassword(tokenPayloadDto, updatePasswordDto);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(exception.message);
        expect(e.errorCode).toBe(exception.errorCode);
        expect(e.fields).toEqual(exception.fields);
        expect(e.httpErrorCode).toBe(exception.httpErrorCode);
      }

      expect(service.findOne).toHaveBeenCalledWith({
        email: tokenPayloadDto.email,
        mobilePhone: tokenPayloadDto.mobilePhone,
      });
      expect(hashingService.compare).toHaveBeenCalledWith(
        updatePasswordDto.oldPassword,
        authMocked.password,
      );
      expect(hashingService.hash).toHaveBeenCalledWith(
        updatePasswordDto.newPassword,
      );
      expect(repo.update).toHaveBeenCalledWith(authMocked.id, {
        password: 'HASHED_PASSWORD',
      });
    });

    it('should throw Custom Exception if new passwords mismatch', async () => {
      const updatePasswordDto = new UpdatePasswordDto();
      updatePasswordDto.newPassword = 'senha_nova';
      updatePasswordDto.confirmNewPassword = 'senha_nova1';
      updatePasswordDto.oldPassword = 'senha_antiga';

      const tokenPayloadDto = new TokenPayloadDto();
      tokenPayloadDto.email = 'lau@mail.com';

      jest.spyOn(service, 'findOne');
      jest.spyOn(hashingService, 'compare');
      jest.spyOn(hashingService, 'hash');
      jest.spyOn(repo, 'update');

      const exception = new CustomException(
        'As senhas não conferem',
        DATA_NOT_MATCH,
        ['newPassword', 'confirmNewPassword'],
        HttpStatus.CONFLICT,
      );

      try {
        await service.updatePassword(tokenPayloadDto, updatePasswordDto);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(exception.message);
        expect(e.errorCode).toBe(exception.errorCode);
        expect(e.fields).toEqual(exception.fields);
        expect(e.httpErrorCode).toBe(exception.httpErrorCode);
      }

      expect(service.findOne).not.toHaveBeenCalled();
      expect(hashingService.hash).not.toHaveBeenCalled();
      expect(hashingService.compare).not.toHaveBeenCalled();
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should throw Custom Exception if old and current passwords mismatch', async () => {
      const updatePasswordDto = new UpdatePasswordDto();
      updatePasswordDto.newPassword = 'senha_nova';
      updatePasswordDto.confirmNewPassword = 'senha_nova';
      updatePasswordDto.oldPassword = 'senha_antiga1';

      const tokenPayloadDto = new TokenPayloadDto();
      tokenPayloadDto.email = 'lau@mail.com';

      const authMocked = {
        id: 'auth-id',
        password: 'senha_antiga',
      } as Auth;

      jest.spyOn(service, 'findOne').mockResolvedValue(authMocked);
      jest.spyOn(hashingService, 'compare').mockResolvedValue(false);

      const exception = new CustomException(
        'Senha inválida',
        INVALID_DATA,
        ['oldPassword'],
        HttpStatus.BAD_REQUEST,
      );

      try {
        await service.updatePassword(tokenPayloadDto, updatePasswordDto);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(exception.message);
        expect(e.errorCode).toBe(exception.errorCode);
        expect(e.fields).toEqual(exception.fields);
        expect(e.httpErrorCode).toBe(exception.httpErrorCode);
      }

      expect(service.findOne).toHaveBeenCalledWith({
        email: tokenPayloadDto.email,
        mobilePhone: tokenPayloadDto.mobilePhone,
      });
      expect(hashingService.compare).toHaveBeenCalledWith(
        updatePasswordDto.oldPassword,
        authMocked.password,
      );
      expect(repo.update).not.toHaveBeenCalled();
    });
  });

  describe('login()', () => {
    it('should return access token and refresh token if successfully logged in', async () => {
      const loginDto = new LoginDto();
      loginDto.email = 'lau@mail.com';
      loginDto.password = 'senha';

      const mockAuth = { id: 'auth-id', password: 'senha' } as Auth;

      jest.spyOn(service, 'findOne').mockResolvedValue(mockAuth);
      jest.spyOn(hashingService, 'compare').mockResolvedValue(true);
      jest.spyOn(service, 'createTokens').mockResolvedValue({
        accessToken: 'ACCESS_TOKEN',
        refreshToken: 'REFRESH_TOKEN',
      });

      const tokens = await service.login(loginDto);
      expect(service.findOne).toHaveBeenCalledWith({
        email: loginDto.email,
        mobilePhone: loginDto.mobilePhone,
      });
      expect(hashingService.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockAuth.password,
      );
      expect(service.createTokens).toHaveBeenCalledWith(mockAuth);
      expect(tokens).toEqual({
        accessToken: 'ACCESS_TOKEN',
        refreshToken: 'REFRESH_TOKEN',
      });
    });

    it('should throw Custom Exception if auth not found', async () => {
      const loginDto = new LoginDto();
      loginDto.email = 'lau@mail.com';
      loginDto.password = 'senha';

      jest.spyOn(service, 'findOne').mockResolvedValue(null);
      jest.spyOn(hashingService, 'compare').mockResolvedValue(true);
      jest.spyOn(service, 'createTokens');

      const exception = new CustomException(
        `email ou senha inválidos`,
        INVALID_DATA,
        ['email', 'password'],
        HttpStatus.BAD_REQUEST,
      );

      try {
        await service.login(loginDto);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(exception.message);
        expect(e.errorCode).toBe(exception.errorCode);
        expect(e.httpErrorCode).toBe(exception.httpErrorCode);
        expect(e.fields).toEqual(exception.fields);
      }

      expect(service.findOne).toHaveBeenCalledWith({
        email: loginDto.email,
        mobilePhone: loginDto.mobilePhone,
      });
      expect(hashingService.compare).toHaveBeenCalledWith(
        loginDto.password,
        '',
      );
      expect(service.createTokens).not.toHaveBeenCalled();
    });

    it('should throw Custom Exception if passwords mismatch', async () => {
      const loginDto = new LoginDto();
      loginDto.email = 'lau@mail.com';
      loginDto.password = 'senha';

      const mockAuth = { id: 'auth-id', password: 'senha' } as Auth;

      jest.spyOn(service, 'findOne').mockResolvedValue(mockAuth);
      jest.spyOn(hashingService, 'compare').mockResolvedValue(false);
      jest.spyOn(service, 'createTokens').mockResolvedValue({
        accessToken: 'ACCESS_TOKEN',
        refreshToken: 'REFRESH_TOKEN',
      });

      const exception = new CustomException(
        `email ou senha inválidos`,
        INVALID_DATA,
        ['email', 'password'],
        HttpStatus.BAD_REQUEST,
      );

      try {
        await service.login(loginDto);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(exception.message);
        expect(e.errorCode).toBe(exception.errorCode);
        expect(e.httpErrorCode).toBe(exception.httpErrorCode);
        expect(e.fields).toEqual(exception.fields);
      }

      expect(service.findOne).toHaveBeenCalledWith({
        email: loginDto.email,
        mobilePhone: loginDto.mobilePhone,
      });
      expect(hashingService.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockAuth.password,
      );
      expect(service.createTokens).not.toHaveBeenCalled();
    });
  });

  describe('refreshTokens()', () => {
    it('should return access and refresh token', async () => {
      const refreshTokenDto = new RefreshTokenDto();
      refreshTokenDto.refreshToken = 'refresh_token';

      const mockTokenPayload = { email: 'lau@mail.com' } as TokenPayloadDto;
      const mockAuth = { id: 'auth-id ' } as Auth;

      const mockTokens = {
        accessToken: 'ACCESS_TOKEN',
        refreshToken: 'REFRESH_TOKEN',
      };

      jest
        .spyOn(service, 'getTokenPayload')
        .mockResolvedValue(mockTokenPayload);

      jest.spyOn(service, 'findOne').mockResolvedValue(mockAuth);

      jest.spyOn(service, 'createTokens').mockResolvedValue(mockTokens);

      const tokens = await service.refreshTokens(refreshTokenDto);
      expect(service.getTokenPayload).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
      expect(service.findOne).toHaveBeenCalledWith({
        email: mockTokenPayload.email,
        mobilePhone: mockTokenPayload.mobilePhone,
      });
      expect(service.createTokens).toHaveBeenCalledWith(mockAuth);
      expect(tokens).toEqual(mockTokens);
    });

    it('should throw Custom Exception if auth not found', async () => {
      const refreshTokenDto = new RefreshTokenDto();
      refreshTokenDto.refreshToken = 'refresh_token';

      const mockTokenPayload = { email: 'lau@mail.com' } as TokenPayloadDto;

      const mockTokens = {
        accessToken: 'ACCESS_TOKEN',
        refreshToken: 'REFRESH_TOKEN',
      };

      const exception = new CustomException(
        'Não foi possível gerar os tokens',
        UNAUTHORIZED,
        [],
        HttpStatus.UNAUTHORIZED,
      );

      jest
        .spyOn(service, 'getTokenPayload')
        .mockResolvedValue(mockTokenPayload);

      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      jest.spyOn(service, 'createTokens').mockResolvedValue(mockTokens);

      try {
        await service.refreshTokens(refreshTokenDto);
      } catch (e) {
        expect(e).toBeInstanceOf(CustomException);
        expect(e.message).toBe(exception.message);
        expect(e.errorCode).toBe(exception.errorCode);
        expect(e.fields).toEqual(exception.fields);
        expect(e.httpErrorCode).toBe(exception.httpErrorCode);
      }

      expect(service.getTokenPayload).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
      expect(service.findOne).toHaveBeenCalledWith({
        email: mockTokenPayload.email,
        mobilePhone: mockTokenPayload.mobilePhone,
      });
      expect(service.createTokens).not.toHaveBeenCalled();
    });
  });

  describe('getTokenPayload()', () => {
    it('should get token payload with email if email', async () => {
      const tokenPayloadMock = {
        email: 'lau@mail.com',
      };

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(tokenPayloadMock);
      jest
        .spyOn(cryptoService, 'decrypt')
        .mockReturnValue(tokenPayloadMock.email);

      const tokenPayload = await service.getTokenPayload('token');

      expect(cryptoService.decrypt).toHaveBeenCalledWith(tokenPayload.email);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        'token',
        mockJwtConfig,
      );
      expect(tokenPayload).toEqual(tokenPayloadMock);
    });

    it('should get token payload with mobile phone if mobile phone', async () => {
      const tokenPayloadMock = {
        mobilePhone: '423423432434',
      };

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(tokenPayloadMock);
      jest
        .spyOn(cryptoService, 'decrypt')
        .mockReturnValue(tokenPayloadMock.mobilePhone);

      const tokenPayload = await service.getTokenPayload('token');

      expect(cryptoService.decrypt).toHaveBeenCalledWith(
        tokenPayload.mobilePhone,
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        'token',
        mockJwtConfig,
      );
      expect(tokenPayload).toEqual(tokenPayloadMock);
    });
  });

  describe('createTokens()', () => {
    it('should contain email and role in payload if email', async () => {
      const auth = {
        email: 'lau@mail.com',
        user: {
          id: 'user-id',
          role: 'admin',
        },
      } as Auth;

      const accessTokenPromise = new Promise<string>((resolve) =>
        setTimeout(() => resolve('access-token'), 100),
      );
      const refreshTokenPromise = new Promise<string>((resolve) =>
        setTimeout(() => resolve('refresh-token'), 50),
      );

      jest
        .spyOn(service, 'signJwtAsync')
        .mockResolvedValueOnce(accessTokenPromise)
        .mockResolvedValueOnce(refreshTokenPromise);

      const tokens = await service.createTokens(auth);

      expect(service.signJwtAsync).toHaveBeenCalledTimes(2);
      expect(service.signJwtAsync).toHaveBeenNthCalledWith(1, auth.user.id, {
        email: auth.email,
        role: auth.user.role,
      } as JwtPayload);
      expect(service.signJwtAsync).toHaveBeenNthCalledWith(2, auth.user.id);
      expect(tokens).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should contain mobile phone and role in payload if mobile phone', async () => {
      const auth = {
        mobilePhone: '324234234',
        user: {
          id: 'user-id',
          role: 'admin',
        },
      } as Auth;

      const accessTokenPromise = new Promise<string>((resolve) =>
        setTimeout(() => resolve('access-token'), 100),
      );
      const refreshTokenPromise = new Promise<string>((resolve) =>
        setTimeout(() => resolve('refresh-token'), 50),
      );

      jest
        .spyOn(service, 'signJwtAsync')
        .mockResolvedValueOnce(accessTokenPromise)
        .mockResolvedValueOnce(refreshTokenPromise);

      const tokens = await service.createTokens(auth);

      expect(service.signJwtAsync).toHaveBeenCalledTimes(2);
      expect(service.signJwtAsync).toHaveBeenNthCalledWith(1, auth.user.id, {
        mobilePhone: auth.mobilePhone,
        role: auth.user.role,
      } as JwtPayload);
      expect(service.signJwtAsync).toHaveBeenNthCalledWith(2, auth.user.id);
      expect(tokens).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });
  });

  describe('findOne()', () => {
    it('should return auth by email if email', async () => {
      const where = {
        email: 'lau@mail.com',
      };

      const mockAuth = {
        email: 'EMAIL_HASHED',
        user: {
          id: 'user-id',
        },
      } as Auth;

      jest.spyOn(cryptoService, 'toHash').mockReturnValue('EMAIL_HASHED');
      jest.spyOn(repo, 'findOne').mockResolvedValue(mockAuth);

      const auth = await service.findOne(where);
      expect(cryptoService.toHash).toHaveBeenCalledWith(where.email);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: {
          emailHash: 'EMAIL_HASHED',
        },
        relations: {
          user: true,
        },
      });
      expect(auth).toEqual(mockAuth);
    });

    it('should return auth by mobile phone if mobile phone', async () => {
      const where = {
        mobilePhone: '2345234234',
      };

      const mockAuth = {
        mobilePhone: 'MOBILE_PHONE_HASHED',
        user: {
          id: 'user-id',
        },
      } as Auth;

      jest
        .spyOn(cryptoService, 'toHash')
        .mockReturnValue('MOBILE_PHONE_HASHED');
      jest.spyOn(repo, 'findOne').mockResolvedValue(mockAuth);

      const auth = await service.findOne(where);
      expect(cryptoService.toHash).toHaveBeenCalledWith(where.mobilePhone);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: {
          mobilePhoneHash: 'MOBILE_PHONE_HASHED',
        },
        relations: {
          user: true,
        },
      });
      expect(auth).toEqual(mockAuth);
    });

    it('should return auth by user if user', async () => {
      const where = {
        userId: 'user-id',
      };

      const mockAuth = {
        user: {
          id: 'user-id',
        },
      } as Auth;

      jest.spyOn(repo, 'findOne').mockResolvedValue(mockAuth);

      const auth = await service.findOne(where);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: {
          user: {
            id: 'user-id',
          },
        },
        relations: {
          user: true,
        },
      });
      expect(auth).toEqual(mockAuth);
    });

    it('should return null if auth not found', async () => {
      const where = {
        userId: 'user-id',
      };

      jest.spyOn(repo, 'findOne').mockResolvedValue(null);

      const auth = await service.findOne(where);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: {
          user: {
            id: 'user-id',
          },
        },
        relations: {
          user: true,
        },
      });
      expect(auth).toEqual(null);
    });
  });
});
