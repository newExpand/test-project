import { NextRequest, NextResponse } from 'next/server';

/**
 * API 서버 URL 설정
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

/**
 * 액세스 토큰이 없을 때 리프레시 토큰을 사용해 갱신 시도
 *
 * 이 함수는 페이지 로드 전에 토큰 상태를 확인하고 필요한 경우 갱신합니다.
 * 미들웨어에서만 처리되며, API 라우트에서는 별도로 처리하지 않습니다.
 */
async function checkAndRefreshToken(
  request: NextRequest
): Promise<string[] | null> {
  // 쿠키에서 토큰 정보 가져오기
  const refreshToken = request.cookies.get('refresh-token')?.value;
  const accessToken = request.cookies.get('access-token')?.value;

  // 리프레시 토큰이 없거나 액세스 토큰이 있으면 처리 불필요
  if (!refreshToken || accessToken) {
    return null;
  }

  // 토큰 리프레시 요청
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refresh-token=${refreshToken}`,
      },
      credentials: 'include',
      cache: 'no-store', // 인증 요청은 항상 캐싱하지 않음
    });

    // 응답에서 쿠키 추출
    if (response.ok) {
      return response.headers.getSetCookie() || [];
    }
  } catch (error) {
    console.error('미들웨어 토큰 리프레시 실패:', error);
  }

  return null;
}

/**
 * 공개 접근 가능한 경로인지 확인
 */
function isPublicRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/api') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/_next') ||
    pathname.includes('/favicon.ico')
  );
}

/**
 * 미들웨어 함수
 *
 * Next.js 애플리케이션의 모든 요청에 대해 실행되며,
 * 페이지 로드에 대해서만 토큰 리프레시 로직을 수행합니다.
 * API 요청은 토큰 리프레시 없이 그대로 전달됩니다.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const accessToken = request.cookies.get('access-token')?.value;
  const refreshToken = request.cookies.get('refresh-token')?.value;
  const pathname = request.nextUrl.pathname;

  // 공개 경로는 인증 검사 없이 통과
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // 토큰이 없으면 로그인 페이지로 리디렉션
  if (!accessToken && !refreshToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 액세스 토큰이 없고 리프레시 토큰이 있는 경우만 토큰 리프레시 시도
  const cookies =
    !accessToken && refreshToken ? await checkAndRefreshToken(request) : null;

  // 다음 미들웨어/페이지로 요청 전달
  const response = NextResponse.next();

  // 새로운 쿠키가 있다면 응답에 추가
  if (cookies && cookies.length > 0) {
    cookies.forEach((cookie) => {
      response.headers.append('Set-Cookie', cookie);
    });
  }

  return response;
}

/**
 * 미들웨어 적용 경로 설정
 */
export const config = {
  matcher: [
    // 정적 파일 제외하고 미들웨어 적용
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
