import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { jwtConstants } from './constants';
import { UserDto } from '../users/users.dto';

interface JwtPayload {
  username: string;
  sub: number;
}

interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(
    username: string,
    pass: string
  ): Promise<Omit<UserDto, 'password'> | null> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Omit<UserDto, 'password'>): Promise<AuthTokens> {
    const payload: JwtPayload = { username: user.username, sub: user.userId };

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtConstants.secret,
      expiresIn: jwtConstants.accessTokenExpiresIn,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtConstants.secret,
      expiresIn: jwtConstants.refreshTokenExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      // 리프레시 토큰 검증
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: jwtConstants.secret,
      });

      // 새 토큰들 생성
      const newPayload: JwtPayload = {
        username: payload.username,
        sub: payload.sub,
      };

      const accessToken = this.jwtService.sign(newPayload, {
        secret: jwtConstants.secret,
        expiresIn: jwtConstants.accessTokenExpiresIn,
      });

      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: jwtConstants.secret,
        expiresIn: jwtConstants.refreshTokenExpiresIn,
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (_e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
