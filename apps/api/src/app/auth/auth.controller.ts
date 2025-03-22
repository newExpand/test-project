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

    // HTTP-only 쿠키에 토큰 저장
    response.cookie(
      'auth-cookie',
      {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS 연결에서만 쿠키 전송
        sameSite: 'strict', // CSRF 방지
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      }
    );

    return { message: 'Login successful' };
  }

  @Post('refresh')
  async refresh(
    @Request() req: RequestWithUser,
    @Res({ passthrough: true }) response: ExpressResponse
  ) {
    // 쿠키에서 리프레시 토큰 가져오기
    const refreshToken = req.cookies['auth-cookie']?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const tokens = await this.authService.refreshTokens(refreshToken);

      // 기존 쿠키에 있는 refreshToken 그대로 유지하면서 accessToken만 업데이트
      response.cookie(
        'auth-cookie',
        {
          accessToken: tokens.accessToken,
          refreshToken: refreshToken,
        },
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        }
      );

      return { message: 'Token refreshed successfully' };
    } catch (_e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: ExpressResponse) {
    // 쿠키 삭제
    response.clearCookie('auth-cookie');
    return { message: 'Logout successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: RequestWithUser) {
    return req.user;
  }
}
