import { createFetch } from 'next-type-fetch';
import { z } from 'zod';

// 기본 API URL 설정 (Next.js 앱에서 사용, 서버 컴포넌트와 클라이언트 컴포넌트 모두)
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Nest.js 백엔드 API URL (오직 Next.js API 라우트에서만 직접 사용)
// 주의: 이 설정은 서버 측 코드에서만 사용해야 함 (Next.js API Routes)
export const BACKEND_API_URL =
  process.env.API_BACKEND_URL || 'http://localhost:3333/api';

// 사용자 스키마 정의 (백엔드 DTO 변경에 맞춰 업데이트)
export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

// 사용자 배열 스키마
export const usersListSchema = z.array(userSchema);

// 사용자 응답 스키마 (Nest.js API 형식에 맞춤)
export const usersResponseSchema = z.object({
  users: usersListSchema,
  lastUpdated: z.string(),
  timestamp: z.string(), // requestId에서 timestamp로 변경
});

// User 타입 정의
export type User = z.infer<typeof userSchema>;

// UsersResponse 타입 정의
export type UsersResponse = z.infer<typeof usersResponseSchema>;

// Next.js 프런트엔드에서 사용할 API 클라이언트
// 이 클라이언트는 Next.js 내부 API 경로를 호출 (/api/*)
export const api = createFetch({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 백엔드 API 클라이언트 (오직 Next.js API 라우트에서만 사용)
// 이 클라이언트는 직접 Nest.js 백엔드를 호출
export const backendApi = createFetch({
  baseURL: BACKEND_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 유틸리티 함수 - 사용자 목록 가져오기 (캐싱 옵션 추가)
export async function getUsers(options?: {
  cache?: RequestCache;
  revalidate?: number;
}) {
  return api.get<UsersResponse>('/users', {
    schema: usersResponseSchema,
    cache: options?.cache,
    next: {
      tags: ['users'],
      ...(options?.revalidate ? { revalidate: options.revalidate } : {}),
    },
  });
}

// 유틸리티 함수 - 단일 사용자 가져오기
export async function getUser(
  id: number,
  options?: { cache?: RequestCache; revalidate?: number }
) {
  return api.get<User>(`/users/${id}`, {
    schema: userSchema,
    cache: options?.cache,
    next: options?.revalidate ? { revalidate: options.revalidate } : undefined,
  });
}

// 유틸리티 함수 - 사용자 생성
export async function createUser(userData: { name: string; email: string }) {
  return api.post<User>('/users', userData, {
    schema: userSchema,
  });
}

// 유틸리티 함수 - 모든 사용자 데이터 업데이트 (캐싱 테스트용)
export async function revalidateUsers() {
  return api.put<UsersResponse>(
    '/users/revalidate',
    {},
    {
      schema: usersResponseSchema,
    }
  );
}
