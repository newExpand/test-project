import axios, {
  AxiosError,
  AxiosInstance,
  AxiosHeaders,
  AxiosRequestHeaders,
} from 'axios';
// import { fetchAdapter } from './axiosFetchAdapter'; // 커스텀 어댑터 제거
import {
  ServerSideConfig,
  ServerSideAdapter,
  TokenRefreshError,
} from './types';

/**
 * API 요청을 위한 공통 설정
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

/**
 * 토큰 리프레시 관련 유틸리티 함수
 */
function createTokenRefreshError(message: string): TokenRefreshError {
  const error = new Error(message) as TokenRefreshError;
  error.isRefreshError = true;
  return error;
}

/**
 * 서버 사이드 관련 유틸리티 함수
 */
async function getServerSideCookies() {
  try {
    const { cookies } = await import('next/headers');
    return await cookies();
  } catch (e) {
    console.warn('서버 사이드 쿠키 접근 실패:', e);
    return null;
  }
}

async function setupServerSideCookies(headers: Headers) {
  if (!headers.has('cookie') && !headers.has('Cookie')) {
    const cookieStore = await getServerSideCookies();
    const cookieString = cookieStore?.toString();
    if (cookieString) {
      headers.set('Cookie', cookieString);
    }
  }
}

function createAxiosHeaders(headers: Headers): AxiosHeaders {
  const axiosHeaders = new AxiosHeaders();
  headers.forEach((value, key) => {
    axiosHeaders.set(key, value);
  });
  return axiosHeaders;
}

/**
 * 서버 사이드에서 토큰 갱신을 시도하는 함수
 * 미들웨어에서 주로 처리되지만, SSR 중 401 에러시 백업으로 사용
 */
async function refreshTokenServer(
  refreshToken: string
): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refresh-token=${refreshToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw createTokenRefreshError('토큰 리프레시 실패');
    }

    const cookies = response.headers.getSetCookie?.() || [];
    const accessTokenCookie = cookies.find((cookie) =>
      cookie.startsWith('access-token=')
    );

    if (!accessTokenCookie) {
      throw createTokenRefreshError('응답에 액세스 토큰이 없음');
    }

    return accessTokenCookie;
  } catch (e) {
    console.error('서버 사이드 토큰 리프레시 실패:', e);
    return null;
  }
}

/**
 * 서버 사이드 어댑터와 관련 함수
 */
function isUnauthorizedError(error: unknown): error is AxiosError {
  return error instanceof AxiosError && error.response?.status === 401;
}

/**
 * 서버 사이드 요청 처리
 * 공식 fetch 어댑터 사용하여 서버 사이드 요청 처리
 */
const serverSideAdapter: ServerSideAdapter = async (config) => {
  try {
    // 서버 사이드 쿠키 설정
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }

    const cookieStore = await getServerSideCookies();
    const cookieString = cookieStore?.toString();
    if (cookieString) {
      config.headers.set('Cookie', cookieString);
    }

    // fetch 어댑터 설정
    config.adapter = 'fetch';

    // fetch 옵션 설정
    config.fetchOptions = {
      ...config.fetchOptions,
      cache: (config.cache as RequestCache) || 'no-store',
      next: config.next || {},
      credentials: config.withCredentials ? 'include' : 'same-origin',
    };

    // 디버깅을 위한 로그 추가
    if (typeof window === 'undefined') {
      console.log(
        `[Server Adapter] ${config.method} ${config.url} - Options:`,
        {
          cache: config.fetchOptions.cache,
          next: config.fetchOptions.next,
        }
      );
    }

    return await axios(config);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      const cookieStore = await getServerSideCookies();
      const refreshToken = cookieStore?.get('refresh-token')?.value;

      if (refreshToken) {
        const newAccessTokenCookie = await refreshTokenServer(refreshToken);
        if (newAccessTokenCookie) {
          if (!config.headers) config.headers = new AxiosHeaders();
          config.headers.set('Cookie', newAccessTokenCookie);
          return await axios(config);
        }
      }
    }
    throw error;
  }
};

/**
 * 클라이언트 사이드 토큰 갱신 처리
 */
async function handleClientSideTokenRefresh(error: AxiosError) {
  const originalRequest = error.config as any;

  // 401 에러가 아니거나 이미 재시도한 요청이면 바로 에러 반환
  if (error.response?.status !== 401 || originalRequest._retry) {
    return Promise.reject(error);
  }

  // 토큰 리프레시 요청 자체에서 발생한 오류면 무한 루프 방지
  if (originalRequest.url === '/auth/refresh') {
    console.error('토큰 리프레시 요청 자체가 실패함');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }

  // 토큰 리프레시 시도
  originalRequest._retry = true;

  try {
    await axiosInstance.post('/auth/refresh');
    return axiosInstance(originalRequest);
  } catch (refreshError) {
    console.error('토큰 리프레시 실패:', refreshError);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return Promise.reject(refreshError);
  }
}

/**
 * axios 인스턴스 설정
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
  adapter: typeof window === 'undefined' ? serverSideAdapter : 'fetch', // 공식 fetch 어댑터 사용
});

// 인터셉터 설정
axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    return typeof window === 'undefined'
      ? Promise.reject(error)
      : handleClientSideTokenRefresh(error);
  }
);

/**
 * Next.js 15 캐싱 설정을 위한 유틸리티 함수
 */
export const withRevalidate = (seconds: number | boolean | undefined) => {
  // 캐싱하지 않음 (기본값)
  if (seconds === undefined) {
    return {
      cache: 'no-store',
      fetchOptions: { cache: 'no-store' },
    };
  }

  // 무기한 캐싱
  if (seconds === false) {
    return {
      next: { revalidate: false },
      cache: 'force-cache',
      revalidate: false,
      fetchOptions: {
        cache: 'force-cache',
        next: { revalidate: false },
      },
    };
  }

  // 특정 시간(초) 동안 캐싱
  if (typeof seconds === 'number') {
    return {
      next: { revalidate: seconds },
      cache: 'force-cache',
      revalidate: seconds,
      fetchOptions: {
        cache: 'force-cache',
        next: { revalidate: seconds },
      },
    };
  }

  // 기타 케이스: 캐싱하지 않음
  return {
    cache: 'no-store',
    fetchOptions: { cache: 'no-store' },
  };
};

export default axiosInstance;
