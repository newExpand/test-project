# next-type-fetch

Next.js App Router용 타입 안전한 fetch 라이브러리. axios와 같은 편의 기능과 zod 검증을 Next.js 캐싱과 함께 제공합니다.

## 특징

- 🔄 **타입 안전한 API 요청**: TypeScript 완벽 지원 및 Zod 스키마 유효성 검사
- ⚙️ **axios와 유사한 API**: baseURL, 헤더, 타임아웃 등 편리한 설정 지원
- 🔌 **인터셉터**: 요청 및 응답을 가로채서 수정/처리
- 🗃️ **Next.js 캐싱 통합**: App Router와 함께 작동
- 📡 **서버/클라이언트 호환**: 서버 컴포넌트와 클라이언트 컴포넌트 모두 지원

## 설치

```bash
npm install next-type-fetch
```

## 기본 사용법

### 인스턴스 생성

```typescript
import { createFetch } from 'next-type-fetch';

// 기본 설정으로 인스턴스 생성
const api = createFetch({
  baseURL: 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});
```

### 기본 요청

```typescript
// GET 요청
const { data, error } = await api.get('/users');

// POST 요청
const { data, error } = await api.post('/users', { name: 'John', email: 'john@example.com' });

// PUT 요청
const { data, error } = await api.put('/users/1', { name: 'Updated Name' });

// DELETE 요청
const { data, error } = await api.delete('/users/1');

// PATCH 요청
const { data, error } = await api.patch('/users/1', { status: 'active' });
```

### Zod 스키마로 응답 검증

```typescript
import { z } from 'zod';

// 사용자 스키마 정의
const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string().datetime(),
});

// 사용자 목록 스키마
const usersListSchema = z.array(userSchema);

// 스키마로 응답 검증
const { data, error } = await api.get('/users', { 
  schema: usersListSchema 
});

if (error) {
  // 유효성 검사 오류 처리
  if (error.validation) {
    console.error('검증 오류:', error.validation.errors);
  } else {
    console.error('API 오류:', error.message);
  }
} else {
  // 데이터는 타입 안전함: User[]
  data.forEach(user => {
    console.log(`${user.name} (${user.email})`);
  });
}
```

### 인터셉터 사용

```typescript
// 요청 인터셉터
api.interceptors.request.use((config) => {
  // JWT 토큰 추가
  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${getAuthToken()}`,
    },
  };
});

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    // 성공 응답 처리
    if (response.data) {
      return response.data; // 응답에서 data 프로퍼티만 추출
    }
    return response;
  },
  (error) => {
    // 오류 응답 처리
    if (error.status === 401) {
      // 인증 오류 시 로그아웃 처리
      logout();
    }
    return Promise.reject(error);
  }
);
```

### Next.js App Router에서 사용

```typescript
// app/api/users/route.ts
import { createFetch } from 'next-type-fetch';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const api = createFetch({
  baseURL: process.env.API_URL,
});

// 사용자 스키마
const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

export async function GET() {
  const { data, error } = await api.get('/users', { 
    schema: z.array(userSchema) 
  });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ users: data });
}
```

### 서버 컴포넌트에서 사용

```tsx
// app/users/page.tsx
import { createFetch } from 'next-type-fetch';
import { z } from 'zod';

const api = createFetch({
  baseURL: process.env.API_URL,
});

// 사용자 스키마
const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

export default async function UsersPage() {
  const { data, error } = await api.get('/users', { 
    schema: z.array(userSchema) 
  });
  
  if (error) {
    return <div>오류가 발생했습니다: {error.message}</div>;
  }
  
  return (
    <div>
      <h1>사용자 목록</h1>
      <ul>
        {data.map(user => (
          <li key={user.id}>{user.name} ({user.email})</li>
        ))}
      </ul>
    </div>
  );
}
```

## 고급 설정

### 타임아웃

```typescript
const api = createFetch({
  baseURL: 'https://api.example.com',
  timeout: 5000, // 5초 후 타임아웃
});
```

### 쿼리 파라미터

```typescript
const { data } = await api.get('/users', {
  params: {
    page: 1,
    limit: 10,
    search: 'john',
  },
});
// GET https://api.example.com/users?page=1&limit=10&search=john
```

### 커스텀 헤더

```typescript
const { data } = await api.get('/users', {
  headers: {
    'X-Custom-Header': 'custom-value',
  },
});
```

### 스키마와 다른 옵션 함께 사용

```typescript
const { data, error } = await api.get('/users', {
  params: { limit: 10 },
  headers: { 'X-Custom-Header': 'custom-value' },
  schema: usersListSchema  // Zod 스키마도 동일한 config 객체 내에 포함
});
```

### POST 요청 시 스키마 사용

```typescript
const { data, error } = await api.post(
  '/users', 
  { name: 'John', email: 'john@example.com' },
  { 
    schema: userSchema,
    headers: { 'X-Custom-Header': 'custom-value' }
  }
);
```

## 라이센스

MIT
