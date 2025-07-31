import { AuthService } from 'src/services/auth/auth.service';
import { Auth } from 'typeorm';

const authsMock = [
  {
    id: 'auth-id-1',
    email: 'lau@mail.com',
    user: {
      id: 'user-id-1',
    },
  } as Auth,
];

export const authServiceMock = {
  provide: AuthService,
  useValue: {
    login: jest.fn().mockImplementation(() => {}),
    findOne: jest
      .fn()
      .mockImplementation(
        (where: {
          email?: string;
          mobilePhone?: string;
          userId?: string;
        }) => {},
      ),
  },
};
