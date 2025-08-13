export class TokenPayloadDto {
  sub: string;
  email?: string;
  mobilePhone?: string;
  iat: number; //issued at
  exp: number;
  aud: string;
  iss: string;
  role: string;
  username?: string;
}
