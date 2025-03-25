import { headers } from 'next/headers';
import { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import type { RequestCookies } from 'next/dist/server/web/spec-extension/cookies';

/**
 * Next.js fetch 요청 설정 타입
 */
export interface NextFetchRequestConfig {
  revalidate?: number | false;
  tags?: string[];
  [key: string]: any;
}

/**
 * Fetch 옵션 타입
 */
export interface FetchOptions {
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
  credentials?: RequestCredentials;
  [key: string]: any;
}

/**
 * 토큰 리프레시 에러 확장 인터페이스
 */
export interface TokenRefreshError extends Error {
  isRefreshError?: boolean;
}

/**
 * 서버 사이드 요청 설정 (쿠키 포함)
 */
export interface ServerSideConfig extends InternalAxiosRequestConfig {
  cookies?: RequestCookies;
  // Next.js 관련 속성 추가
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
  fetchOptions?: FetchOptions;
}

/**
 * 서버 사이드 어댑터 타입
 */
export type ServerSideAdapter = (
  config: ServerSideConfig
) => Promise<AxiosResponse>;

/**
 * API 요청 옵션 (Next.js 15 호환)
 */
export interface ApiOptions<D = any> {
  // 기본 API 옵션
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: D;
  timeout?: number;

  // Next.js 캐싱 설정
  cache?: RequestCache;
  revalidate?: number | false;
  tags?: string[];

  // Next.js config 객체 (직접 설정할 경우)
  next?: NextFetchRequestConfig | undefined;
}

/**
 * 지원되는 API 메서드
 */
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * API 에러 확장 타입
 */
export interface ApiError extends AxiosError {
  isApiError: true;
}
