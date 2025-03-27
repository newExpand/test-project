import { z } from 'zod';

/**
 * HTTP 메서드 타입
 */
export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS';

/**
 * 기본 설정 옵션 인터페이스
 */
export interface FetchConfig
  extends Omit<RequestInit, 'signal' | 'headers' | 'body' | 'method'> {
  /**
   * 기본 URL
   */
  baseURL?: string;

  /**
   * 요청 타임아웃 (ms)
   */
  timeout?: number;

  /**
   * 요청 헤더
   */
  headers?: Record<string, string>;

  /**
   * 요청 쿼리 파라미터
   */
  params?: Record<string, string | number | boolean | undefined | null>;

  /**
   * 자동 재시도 횟수
   */
  retry?: number;

  /**
   * 응답을 JSON으로 파싱 여부
   */
  parseJSON?: boolean;

  /**
   * 응답 데이터 검증을 위한 Zod 스키마
   */
  schema?: z.ZodType<any>;
}

/**
 * 특정 요청에 대한 설정 인터페이스
 */
export interface RequestConfig extends FetchConfig {
  /**
   * 요청 URL
   */
  url?: string;

  /**
   * HTTP 메서드
   */
  method?: HttpMethod;

  /**
   * 요청 본문
   */
  data?: unknown;
}

/**
 * 인터셉터 핸들러 타입
 */
export type RequestInterceptor = (
  config: RequestConfig
) => Promise<RequestConfig> | RequestConfig;
export type ResponseInterceptor<T = any> = (response: T) => Promise<T> | T;
export type ErrorInterceptor = (error: any) => Promise<any> | any;

/**
 * 인터셉터 인터페이스
 */
export interface Interceptors {
  request: {
    use: (interceptor: RequestInterceptor) => number;
    eject: (id: number) => void;
  };
  response: {
    use: (
      onFulfilled?: ResponseInterceptor,
      onRejected?: ErrorInterceptor
    ) => number;
    eject: (id: number) => void;
  };
}

/**
 * Zod 스키마와 함께 사용하는 응답 타입
 */
export type ZodResponse<T> =
  | {
      data: T;
      error: null;
      status: number;
      headers: Headers;
    }
  | {
      data: null;
      error: {
        message: string;
        status?: number;
        validation?: z.ZodError;
        raw?: any;
      };
      status?: number;
      headers?: Headers;
    };

/**
 * Next Type Fetch 인스턴스 인터페이스
 */
export interface NextTypeFetch {
  /**
   * 전역 설정
   */
  defaults: FetchConfig;

  /**
   * 인터셉터
   */
  interceptors: Interceptors;

  /**
   * GET 요청
   */
  get: <T = any>(url: string, config?: FetchConfig) => Promise<ZodResponse<T>>;

  /**
   * POST 요청
   */
  post: <T = any>(
    url: string,
    data?: any,
    config?: FetchConfig
  ) => Promise<ZodResponse<T>>;

  /**
   * PUT 요청
   */
  put: <T = any>(
    url: string,
    data?: any,
    config?: FetchConfig
  ) => Promise<ZodResponse<T>>;

  /**
   * DELETE 요청
   */
  delete: <T = any>(
    url: string,
    config?: FetchConfig
  ) => Promise<ZodResponse<T>>;

  /**
   * PATCH 요청
   */
  patch: <T = any>(
    url: string,
    data?: any,
    config?: FetchConfig
  ) => Promise<ZodResponse<T>>;

  /**
   * 기본 요청 메서드
   */
  request: <T = any>(config: RequestConfig) => Promise<ZodResponse<T>>;
}
