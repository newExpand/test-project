import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import type {
  Response as ExpressResponse,
  Request as ExpressRequest,
} from 'express';
import { jwtConstants } from './constants';

interface RequestWithUser extends ExpressRequest {
  user: { userId: number; username: string };
  cookies: Record<string, any>;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req: RequestWithUser,
    @Res({ passthrough: true }) response: ExpressResponse
  ) {
    const tokens = await this.authService.login(req.user);

    // Access Token을 위한 쿠키 설정
    response.cookie('access-token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 1000, // 10초
    });

    // Refresh Token을 위한 쿠키 설정
    response.cookie('refresh-token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 * 1000, // 7일
    });

    return { message: 'Login successful' };
  }

  @Post('refresh')
  async refresh(
    @Request() req: RequestWithUser,
    @Res({ passthrough: true }) response: ExpressResponse
  ) {
    // 쿠키에서 리프레시 토큰 가져오기
    const refreshToken = req.cookies['refresh-token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const tokens = await this.authService.refreshTokens(refreshToken);

      // 새로운 액세스 토큰 설정
      response.cookie('access-token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 10 * 1000, // 10초
      });

      // 새로운 리프레시 토큰 설정
      response.cookie('refresh-token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 * 1000, // 7일
      });

      return { message: 'Tokens refreshed successfully' };
    } catch (_e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: ExpressResponse) {
    // 모든 인증 관련 쿠키 삭제
    response.clearCookie('access-token');
    response.clearCookie('refresh-token');
    return { message: 'Logout successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: RequestWithUser) {
    return req.user;
  }
}
