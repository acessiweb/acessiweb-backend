export class TokenPayloadDto {
  sub: string;
  email?: string;
  mobilePhone?: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
  role: string;
}
