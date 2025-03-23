/**
 * API 라이브러리 내보내기
 *
 * 클라이언트와 서버 양쪽에서 일관된 API 호출 메커니즘을 제공합니다.
 */

// 기본 axios 설정
export { default as axios } from './axios';
export { API_BASE_URL, withRevalidate } from './axios';

// 범용 API (서버/클라이언트 공통)
export * from './universalApi';
export { default as universalApi } from './universalApi';

// React Query 통합 API
export * from './useQueryApi';
export { default as ReactQueryProvider } from './ReactQueryProvider';

// 타입 내보내기
export * from './types';
export * from 'axios';
