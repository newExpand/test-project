import { NextRequest, NextResponse } from 'next/server';

/**
 * API 프록시 설정
 */
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

/**
 * 공통 HTTP 메서드 타입
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * 메서드별 핸들러
 * Next.js 15에서는 GET 핸들러가 더 이상 기본적으로 캐싱되지 않습니다.
 *
 * 이 API 라우트의 주 목적은 실제 API 서버로 요청을 프록시하고,
 * 응답을 클라이언트에 반환하는 것입니다. 토큰 리프레시 로직은
 * middleware.ts에서 처리합니다.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleApiRequest(request, resolvedParams.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleApiRequest(request, resolvedParams.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleApiRequest(request, resolvedParams.path, 'PUT');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleApiRequest(request, resolvedParams.path, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleApiRequest(request, resolvedParams.path, 'DELETE');
}

/**
 * API 요청을 처리하고 응답을 반환하는 함수
 *
 * 이 함수는 클라이언트의 요청을 실제 API 서버로 전달하고,
 * API 서버의 응답(데이터와 쿠키 포함)을 그대로 클라이언트에 반환합니다.
 */
async function handleApiRequest(
  request: NextRequest,
  pathSegments: string[],
  method: HttpMethod
) {
  try {
    // API URL 구성
    const apiPath = ['api', ...pathSegments].join('/');
    const targetUrl = new URL(apiPath, baseUrl + '/');
    targetUrl.search = request.nextUrl.search;

    // 요청 헤더 준비
    const requestHeaders = new Headers();

    // 중요한 헤더만 복사
    const importantHeaders = [
      'authorization',
      'content-type',
      'accept',
      'cookie',
      'user-agent',
    ];

    importantHeaders.forEach((header) => {
      const value = request.headers.get(header);
      if (value) requestHeaders.set(header, value);
    });

    // API 서버로 요청 전송
    const response = await fetch(targetUrl.toString(), {
      method,
      headers: requestHeaders,
      body: method !== 'GET' ? await request.text() : null,
      credentials: 'include',
      cache: 'no-store', // 인증 관련 요청은 캐싱하지 않음
    });

    // 응답 데이터 준비
    const responseData = await response.text();

    // 새로운 응답 생성
    const newResponse = new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type':
          response.headers.get('Content-Type') || 'application/json',
      },
    });

    // API 서버에서 설정한 Set-Cookie 헤더를 클라이언트에 전달
    const cookies = response.headers.getSetCookie();
    if (cookies?.length) {
      cookies.forEach((cookie) => {
        newResponse.headers.append('Set-Cookie', cookie);
      });
    }

    return newResponse;
  } catch (error) {
    console.error('API Route error:', error);

    return new NextResponse(
      JSON.stringify({
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
