import { FetchConfig, RequestConfig } from '../types/index.js';

/**
 * URL에 쿼리 파라미터를 추가합니다.
 * @param url 기본 URL
 * @param params 쿼리 파라미터 객체
 * @returns 쿼리 파라미터가 추가된 URL
 */
export function appendQueryParams(
  url: string,
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  if (!params) return url;

  const urlObj = new URL(url, 'http://dummy-base.com');

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      urlObj.searchParams.append(key, String(value));
    }
  });

  // 'http://dummy-base.com' 제거
  return urlObj.href.replace('http://dummy-base.com', '');
}

/**
 * 베이스 URL과 상대 경로를 합칩니다.
 * @param baseURL 베이스 URL
 * @param url 상대 경로
 * @returns 완전한 URL
 */
export function combineURLs(baseURL?: string, url?: string): string {
  if (!baseURL) return url || '';
  if (!url) return baseURL;

  const baseEndsWithSlash = baseURL.endsWith('/');
  const urlStartsWithSlash = url.startsWith('/');

  if (baseEndsWithSlash && urlStartsWithSlash) {
    return baseURL + url.substring(1);
  } else if (!baseEndsWithSlash && !urlStartsWithSlash) {
    return `${baseURL}/${url}`;
  }

  return baseURL + url;
}

/**
 * 요청 설정을 병합합니다.
 * @param defaultConfig 기본 설정
 * @param requestConfig 요청별 설정
 * @returns 병합된 설정
 */
export function mergeConfigs(
  defaultConfig: FetchConfig = {},
  requestConfig: RequestConfig = {}
): RequestConfig {
  // RequestConfig 타입으로 캐스팅
  const mergedConfig = {
    ...defaultConfig,
    ...requestConfig,
  } as RequestConfig;

  // 헤더 병합
  mergedConfig.headers = {
    ...defaultConfig.headers,
    ...requestConfig.headers,
  };

  // 쿼리 파라미터 병합
  mergedConfig.params = {
    ...defaultConfig.params,
    ...requestConfig.params,
  };

  return mergedConfig;
}

/**
 * 타임아웃 프로미스를 생성합니다.
 * @param ms 타임아웃 시간 (ms)
 * @returns Promise와 AbortController
 */
export function createTimeoutPromise(
  ms?: number
): { promise: Promise<never>; controller: AbortController } | null {
  if (!ms || ms <= 0) return null;

  const controller = new AbortController();

  const promise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      controller.abort();
      reject(new Error(`Request timeout of ${ms}ms exceeded`));
    }, ms);
  });

  return { promise, controller };
}

/**
 * 객체가 비어 있는지 확인합니다.
 * @param obj 객체
 * @returns 비어 있는지 여부
 */
export function isEmptyObject(obj?: Record<string, any>): boolean {
  return !obj || Object.keys(obj).length === 0;
}

/**
 * 객체를 JSON 문자열로 변환합니다.
 * @param data 객체
 * @returns JSON 문자열
 */
export function stringifyData(data: unknown): string | null {
  if (data === undefined || data === null) return null;
  if (typeof data === 'string') return data;

  try {
    return JSON.stringify(data);
  } catch (e) {
    console.error('Failed to stringify data:', e);
    return null;
  }
}
