import axiosInstance, { withRevalidate } from './axios';
import type { ApiOptions, ApiMethod } from './types';

/**
 * 클라이언트와 서버 컴포넌트 모두에서 사용 가능한 범용 API 함수
 */
export async function api<T = any, D = any>(
  method: ApiMethod,
  url: string,
  options: ApiOptions<D> = {}
): Promise<T> {
  // 옵션 구조분해
  const {
    revalidate,
    tags,
    headers = {},
    params,
    data,
    timeout,
    cache,
    next = {},
  } = options;

  // Next.js 캐싱 설정 구성
  const nextOptions = {
    ...next,
    ...(revalidate !== undefined ? { revalidate } : {}),
    ...(tags?.length ? { tags } : {}),
  };

  // 캐싱 설정 적용
  const revalidateConfig = withRevalidate(nextOptions.revalidate);

  // API 요청 설정
  const config = {
    method,
    url,
    params,
    ...(data && method !== 'GET' ? { data } : {}),
    ...(timeout ? { timeout } : {}),
    ...revalidateConfig,
    headers: prepareHeaders(headers, nextOptions, cache),
  };

  // 요청 실행 및 결과 반환
  const response = await axiosInstance.request<T>(config);
  return response.data;
}

/**
 * 요청 헤더 준비
 */
function prepareHeaders(
  headers: Record<string, string>,
  nextOptions: { revalidate?: number | false; tags?: string[] },
  cache?: RequestCache
): Record<string, string> {
  return {
    ...headers,
    ...(nextOptions.tags?.length
      ? { 'x-nextjs-tags': nextOptions.tags.join(',') }
      : {}),
    ...(cache === 'force-cache' ? { 'x-cache-control': cache } : {}),
  };
}

/**
 * HTTP 메서드별 헬퍼 함수
 */
export const get = <T = any>(url: string, options?: ApiOptions): Promise<T> =>
  api<T>('GET', url, options);

export const post = <T = any, D = any>(
  url: string,
  data?: D,
  options?: Omit<ApiOptions, 'data'>
): Promise<T> => api<T, D>('POST', url, { ...options, data });

export const put = <T = any, D = any>(
  url: string,
  data?: D,
  options?: Omit<ApiOptions, 'data'>
): Promise<T> => api<T, D>('PUT', url, { ...options, data });

export const patch = <T = any, D = any>(
  url: string,
  data?: D,
  options?: Omit<ApiOptions, 'data'>
): Promise<T> => api<T, D>('PATCH', url, { ...options, data });

export const del = <T = any>(url: string, options?: ApiOptions): Promise<T> =>
  api<T>('DELETE', url, options);

/**
 * React Hook 환경에서 API 요청을 수행하는 함수
 */
export function useUniversalApi() {
  const isClient = typeof window !== 'undefined';

  const warnIfServerSide = () => {
    if (!isClient) {
      console.warn(
        'useUniversalApi는 클라이언트 컴포넌트에서만 사용해야 합니다.'
      );
    }
  };

  // 각 API 메서드에 서버 사이드 경고 추가
  return {
    get: <T = any>(url: string, options?: ApiOptions): Promise<T> => {
      warnIfServerSide();
      return get<T>(url, options);
    },
    post: <T = any, D = any>(
      url: string,
      data?: D,
      options?: Omit<ApiOptions, 'data'>
    ): Promise<T> => {
      warnIfServerSide();
      return post<T, D>(url, data, options);
    },
    put: <T = any, D = any>(
      url: string,
      data?: D,
      options?: Omit<ApiOptions, 'data'>
    ): Promise<T> => {
      warnIfServerSide();
      return put<T, D>(url, data, options);
    },
    patch: <T = any, D = any>(
      url: string,
      data?: D,
      options?: Omit<ApiOptions, 'data'>
    ): Promise<T> => {
      warnIfServerSide();
      return patch<T, D>(url, data, options);
    },
    delete: <T = any>(url: string, options?: ApiOptions): Promise<T> => {
      warnIfServerSide();
      return del<T>(url, options);
    },
  };
}

export default {
  get,
  post,
  put,
  patch,
  delete: del,
  api,
  useUniversalApi,
};
