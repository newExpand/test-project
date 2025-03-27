import { NextRequest, NextResponse } from 'next/server';
import { backendApi } from '@/lib/api';

/**
 * Next.js API Route 핸들러: 모든 API 요청을 백엔드로 프록시합니다.
 *
 * @param request 들어오는 Next.js 요청
 * @param context 요청 컨텍스트 (동적 경로 파라미터 포함)
 * @returns NextResponse
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const paths = (await params).path;
  try {
    const path = paths.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `/${path}${searchParams ? `?${searchParams}` : ''}`;

    console.log(`[API 프록시] GET 요청: ${url}`);

    // backendApi 사용
    const response = await backendApi.get(url);

    // 응답 반환
    return NextResponse.json(response.data || {}, {
      status: response.status || 200,
    });
  } catch (error) {
    console.error('[API 프록시] GET 요청 오류:', error);
    return NextResponse.json(
      { error: '백엔드 요청 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

/**
 * POST 요청 프록시 처리
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const paths = (await params).path;
    const path = paths.join('/');
    const requestData = await request.json();

    console.log(`[API 프록시] POST 요청: /${path}`);

    // backendApi 사용
    const response = await backendApi.post(`/${path}`, requestData);

    // 응답 반환
    return NextResponse.json(response.data || {}, {
      status: response.status || 201,
    });
  } catch (error) {
    console.error('[API 프록시] POST 요청 오류:', error);
    return NextResponse.json(
      { error: '백엔드 요청 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

/**
 * PUT 요청 프록시 처리
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const paths = (await params).path;
    const path = paths.join('/');
    const requestData = await request.json().catch(() => ({}));

    console.log(`[API 프록시] PUT 요청: /${path}`);

    // backendApi 사용
    const response = await backendApi.put(`/${path}`, requestData);

    // 응답 반환
    return NextResponse.json(response.data || {}, {
      status: response.status || 200,
    });
  } catch (error) {
    console.error('[API 프록시] PUT 요청 오류:', error);
    return NextResponse.json(
      { error: '백엔드 요청 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

/**
 * DELETE 요청 프록시 처리
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const paths = (await params).path;
    const path = paths.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `/${path}${searchParams ? `?${searchParams}` : ''}`;

    console.log(`[API 프록시] DELETE 요청: ${url}`);

    // backendApi 사용
    const response = await backendApi.delete(url);

    // 응답 반환
    return NextResponse.json(response.data || {}, {
      status: response.status || 200,
    });
  } catch (error) {
    console.error('[API 프록시] DELETE 요청 오류:', error);
    return NextResponse.json(
      { error: '백엔드 요청 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

/**
 * PATCH 요청 프록시 처리
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const paths = (await params).path;
    const path = paths.join('/');
    const requestData = await request.json();

    console.log(`[API 프록시] PATCH 요청: /${path}`);

    // backendApi 사용
    const response = await backendApi.patch(`/${path}`, requestData);

    // 응답 반환
    return NextResponse.json(response.data || {}, {
      status: response.status || 200,
    });
  } catch (error) {
    console.error('[API 프록시] PATCH 요청 오류:', error);
    return NextResponse.json(
      { error: '백엔드 요청 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
