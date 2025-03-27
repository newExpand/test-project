---
title: "next-type-fetch 라이브러리: Next.js와 Zod를 활용한 타입 안전한 API 클라이언트"
description: "Next.js App Router 환경에서 타입 안전한 API 요청을 위한 fetch 기반 라이브러리 개발 과정과 활용 사례"
category: "프로젝트"
tags: ["Next.js", "TypeScript", "Zod", "API", "라이브러리", "fetch", "next-type-fetch"]
status: "draft"
---

# next-type-fetch 라이브러리

Next.js의 App Router와 함께 사용할 수 있는 타입 안전한 HTTP 클라이언트 라이브러리를 개발했습니다. 이 글에서는 라이브러리 개발 배경, 주요 기능, 구현 과정, 그리고 실제 Next.js 애플리케이션에서의 활용 사례를 공유합니다.

## 작업 개요

### 작업 배경
Next.js App Router를 사용하는 프로젝트에서 API 요청을 처리할 때 다음과 같은 문제점을 발견했습니다:

1. 기본 `fetch` API는 편의 기능이 부족함
2. 타입 안전성을 위한 별도의 검증 코드가 필요함
3. Next.js의 캐싱과 통합하기 위한 설정이 반복적임
4. axios와 같은 기존 라이브러리는 Next.js 환경에 최적화되지 않음

이러한 문제를 해결하기 위해 Next.js에 최적화된 타입 안전한 HTTP 클라이언트 라이브러리를 개발하게 되었습니다.

### 목적
- TypeScript와 Zod를 활용한 완전한 타입 안전성 제공
- axios와 유사한 직관적인 API 인터페이스 제공
- Next.js의 캐싱 메커니즘과 완벽하게 통합
- 요청과 응답 인터셉터를 통한 확장성 제공

### 사용 기술/도구
- TypeScript: 타입 안전성 보장
- Zod: 런타임 데이터 검증
- Vitest: 유닛 테스트
- Next.js App Router: 통합 테스트

## 구현 과정

### 수행한 작업

#### 1. 인터페이스 설계
먼저 라이브러리의 사용성을 고려하여 다음과 같은 인터페이스를 설계했습니다:

```typescript
// 라이브러리 인스턴스 생성
const api = createFetch({
  baseURL: 'https://api.example.com',
  headers: { ... },
  timeout: 5000
});

// HTTP 메서드 사용
const result = await api.get('/users', { schema: userSchema });

// 결과 처리
if (result.error) {
  // 오류 처리
} else {
  // 타입 안전한 데이터 사용
  console.log(result.data);
}
```

#### 2. 코어 기능 구현
다음으로 라이브러리의 핵심 기능을 구현했습니다:

- `createFetch`: 기본 설정을 받아 API 클라이언트 인스턴스 생성
- HTTP 메서드 래퍼 (`get`, `post`, `put`, `delete`, `patch`)
- 요청 처리 및 응답 파싱 로직

#### 3. 인터셉터 메커니즘 구현
요청과 응답을 가로채서 수정할 수 있는 인터셉터 시스템을 구현했습니다:

- `InterceptorManager` 클래스: 인터셉터 등록, 제거, 실행 기능
- 요청 인터셉터: 요청 전송 전 설정 수정 가능
- 응답 인터셉터: 응답 처리 전 데이터 변환 가능
- 오류 인터셉터: 오류 발생 시 처리 로직

#### 4. 유틸리티 함수 개발
라이브러리 내부에서 사용할 다양한 유틸리티 함수를 개발했습니다:

- URL 조합 및 쿼리 파라미터 처리
- 설정 병합
- 타임아웃 처리
- 데이터 직렬화

#### 5. 테스트 작성
라이브러리의 안정성을 보장하기 위해 다양한 테스트를 작성했습니다:

- 기본 인스턴스 생성 테스트
- HTTP 메서드별 요청 실행 테스트
- Zod 스키마 검증 테스트
- 인터셉터 동작 테스트
- 오류 처리 테스트

### 주요 포인트

#### 타입 안전성 구현
TypeScript와 Zod를 조합하여 완벽한 타입 안전성을 구현했습니다:

1. TypeScript 인터페이스를 통한 정적 타입 검사
2. Zod 스키마를 통한 런타임 데이터 검증
3. 제네릭을 활용한 타입 추론

```typescript
// Zod 스키마 정의
const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email()
});

// 타입 안전한 API 요청
const result = await api.get('/users/1', { schema: userSchema });
```

#### 인터셉터 시스템 설계
확장성을 고려한 인터셉터 시스템을 설계했습니다:

```typescript
// 요청 인터셉터
api.interceptors.request.use((config) => {
  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${getToken()}`
    }
  };
});

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    // 응답 데이터 변환
    return response.data;
  },
  (error) => {
    // 오류 처리
    return Promise.reject(error);
  }
);
```

#### Next.js 통합
Next.js App Router와의 통합을 위한 기능을 구현했습니다:

```typescript
// Next.js 캐싱 옵션 지원
const result = await api.get('/users', {
  cache: 'force-cache',
  next: {
    tags: ['users'],
    revalidate: 60
  }
});
```

### 해결한 문제

1. **타입 불일치 문제**: Zod 스키마를 통해 백엔드 API 응답과 프론트엔드 타입 간의 불일치 해결
2. **캐싱 설정 복잡성**: Next.js 캐싱 옵션을 API 클라이언트에 통합하여 사용 편의성 향상
3. **인증 토큰 관리**: 인터셉터를 통한 자동 토큰 추가 및 갱신
4. **오류 처리 일관성**: 표준화된 오류 처리 패턴 제공

## 주요 코드

### 라이브러리 인스턴스 생성 함수

```typescript
export function createFetch(defaultConfig: FetchConfig = {}): NextTypeFetch {
  const interceptors = createInterceptors();

  async function request<T = any>(config: RequestConfig): Promise<ZodResponse<T>> {
    try {
      // 스키마 추출
      const schema = config.schema as z.ZodType<T> | undefined;
      delete config.schema;

      // 요청 인터셉터 실행
      const requestConfig = await interceptors.request.run(config);

      // URL 조합 및 쿼리 파라미터 추가
      const url = combineURLs(requestConfig.baseURL, requestConfig.url);
      const fullUrl = appendQueryParams(url, requestConfig.params);

      // 타임아웃 설정
      const timeoutResult = createTimeoutPromise(requestConfig.timeout);
      
      // fetch 요청 실행
      const response = await (timeoutResult
        ? Promise.race([fetch(fullUrl, requestInit), timeoutResult.promise])
        : fetch(fullUrl, requestInit));

      // 응답 처리 및 스키마 검증
      // ...

      return { data, error: null, status, headers };
    } catch (error) {
      // 오류 처리
      // ...
      return { data: null, error: { message, raw: processedError } };
    }
  }

  // HTTP 메서드별 래퍼 함수들
  // ...

  return instance;
}
```

### 인터셉터 매니저 클래스

```typescript
export class InterceptorManager<T> {
  private handlers: Array<{ id: number; handler: T } | null> = [];
  private idCounter = 0;

  use(handler: T): number {
    const id = this.idCounter++;
    this.handlers.push({ id, handler });
    return id;
  }

  eject(id: number): void {
    const index = this.handlers.findIndex((h) => h !== null && h.id === id);
    if (index !== -1) {
      this.handlers[index] = null;
    }
  }

  async forEach<V>(value: V): Promise<V> {
    let result = value;
    for (const handler of this.handlers) {
      if (handler !== null) {
        result = (await handler.handler(result as any)) as unknown as V;
      }
    }
    return result;
  }
}
```

## 결과

### 구현 결과
next-type-fetch 라이브러리는 다음과 같은 기능을 성공적으로 구현했습니다:

1. **타입 안전한 API 요청**: TypeScript와 Zod를 활용한 완벽한 타입 지원
2. **편리한 API**: axios와 유사한 직관적인 인터페이스 제공
3. **인터셉터 지원**: 요청 및 응답 가로채기와 수정 기능
4. **Next.js 통합**: App Router의 캐싱 메커니즘과 완벽한 통합
5. **확장성**: 다양한 사용 사례에 적용 가능한 유연한 설계

### 실제 프로젝트 적용 사례

Next.js 프로젝트에 next-type-fetch 라이브러리를 적용한 결과, 다음과 같은 이점을 얻을 수 있었습니다:

#### API 클라이언트 설정 
```typescript
// lib/api.ts
import { createFetch } from 'next-type-fetch';
import { z } from 'zod';

// API 클라이언트 생성
export const api = createFetch({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 사용자 스키마 정의
export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

// 사용자 응답 스키마
export const usersResponseSchema = z.object({
  users: z.array(userSchema),
  lastUpdated: z.string(),
  timestamp: z.string(),
});

// 유틸리티 함수
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
```

#### 서버 컴포넌트에서 사용
```typescript
// app/users/page.tsx
import { getUsers } from '@/lib/api';

export const revalidate = 30; // 30초마다 재검증

export default async function UsersPage() {
  // 캐시 태그를 이용해 데이터 가져오기
  const result = await getUsers({
    revalidate: 30,
  });

  if (result.error) {
    return <div>오류가 발생했습니다: {result.error.message}</div>;
  }

  const { users, lastUpdated, timestamp } = result.data;

  return (
    <div>
      <h1>사용자 목록</h1>
      {/* 사용자 데이터 렌더링 */}
    </div>
  );
}
```

#### 캐싱 제어 옵션
```typescript
// 캐싱 없이 항상 새로운 데이터를 요청
const result = await getUsers({
  cache: 'no-store',
});

// 캐시된 데이터 사용 (ISR 방식)
const result = await getUsers({
  cache: 'force-cache',
  revalidate: 60,
});
```

#### 수동 재검증 구현
```typescript
// Server Action
export async function revalidateUserData() {
  try {
    // 백엔드 API 호출
    await backendApi.put('/users/revalidate');
    
    // Next.js 캐시 태그 무효화
    revalidateTag('users');
    
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
```

### 배운 점

이 라이브러리를 개발하면서 얻은 주요 인사이트:

1. **타입 안전성의 중요성**: TypeScript와 Zod의 조합이 런타임 안전성을 크게 향상시킴
2. **인터셉터 패턴의 유용성**: 요청/응답 처리를 모듈화하고 분리할 수 있어 코드 관리가 용이해짐
3. **Next.js 캐싱 메커니즘**: App Router의 다양한 캐싱 전략을 효과적으로 활용하는 방법
4. **테스트 주도 개발**: 유닛 테스트를 통해 라이브러리의 안정성 보장
5. **API 설계의 중요성**: 직관적인 API 설계가 라이브러리 사용성에 큰 영향을 미침

## 참고 자료

### 링크
- [next-type-fetch GitHub 저장소](https://github.com/username/next-type-fetch)
- [Next.js App Router 문서](https://nextjs.org/docs/app)
- [Zod 문서](https://github.com/colinhacks/zod)

### 문서
- [Next.js Fetching, Caching, and Revalidating](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Web API - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
