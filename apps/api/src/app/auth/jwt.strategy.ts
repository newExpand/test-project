import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './constants';
import type { Request } from 'express';

interface JwtPayload {
  username: string;
  sub: number;
  iat: number;
  exp: number;
}

interface UserInfo {
  userId: number;
  username: string;
}

interface CookieWithToken {
  accessToken: string;
  refreshToken?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const data = request?.cookies['auth-cookie'] as
            | CookieWithToken
            | undefined;
          if (!data) {
            return null;
          }
          return data.accessToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: JwtPayload): Promise<UserInfo> {
    return { userId: payload.sub, username: payload.username };
  }
}
