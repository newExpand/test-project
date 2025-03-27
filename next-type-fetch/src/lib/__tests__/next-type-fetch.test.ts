import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';
import { createFetch } from '../next-type-fetch.js';

describe('next-type-fetch', () => {
  // 전역 fetch 모킹
  const originalFetch = global.fetch;
  const mockFetch = vi.fn();

  beforeEach(() => {
    // fetch 모킹
    global.fetch = mockFetch as any;
    mockFetch.mockClear();
  });

  afterEach(() => {
    // 원래 fetch 복원
    global.fetch = originalFetch;
  });

  it('기본 인스턴스 생성', () => {
    const api = createFetch();

    expect(api).toBeDefined();
    expect(api.get).toBeInstanceOf(Function);
    expect(api.post).toBeInstanceOf(Function);
    expect(api.put).toBeInstanceOf(Function);
    expect(api.delete).toBeInstanceOf(Function);
    expect(api.patch).toBeInstanceOf(Function);
    expect(api.request).toBeInstanceOf(Function);
    expect(api.interceptors).toBeDefined();
    expect(api.defaults).toBeDefined();
  });

  it('기본 설정 옵션 적용', () => {
    const baseConfig = {
      baseURL: 'https://api.example.com',
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-Header': 'test-value',
      },
      timeout: 5000,
    };

    const api = createFetch(baseConfig);

    expect(api.defaults).toEqual(baseConfig);
  });

  it('GET 요청 실행', async () => {
    const mockResponse = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    };

    // 응답 모킹
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': 'application/json',
      }),
      json: async () => mockResponse,
    });

    const api = createFetch({ baseURL: 'https://api.example.com' });
    const result = await api.get('/users/1');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toBe('https://api.example.com/users/1');
    expect(result.data).toEqual(mockResponse);
    expect(result.error).toBeNull();
    expect(result.status).toBe(200);
  });

  it('POST 요청과 데이터 전송', async () => {
    const requestData = { name: 'New User', email: 'new@example.com' };
    const mockResponse = { id: 2, ...requestData };

    // 응답 모킹
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      headers: new Headers({
        'content-type': 'application/json',
      }),
      json: async () => mockResponse,
    });

    const api = createFetch({ baseURL: 'https://api.example.com' });
    const result = await api.post('/users', requestData);

    expect(mockFetch).toHaveBeenCalledTimes(1);

    // 첫 번째 인자는 URL
    expect(mockFetch.mock.calls[0][0]).toBe('https://api.example.com/users');

    // 두 번째 인자는 요청 옵션
    const requestInit = mockFetch.mock.calls[0][1];
    expect(requestInit.method).toBe('POST');
    expect(requestInit.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(requestInit.body)).toEqual(requestData);

    // 응답 확인
    expect(result.data).toEqual(mockResponse);
    expect(result.error).toBeNull();
    expect(result.status).toBe(201);
  });

  it('zod 스키마를 사용한 요청 검증 성공', async () => {
    const mockResponse = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    };

    // 응답 모킹
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': 'application/json',
      }),
      json: async () => mockResponse,
    });

    // Zod 스키마 정의
    const userSchema = z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email(),
    });

    const api = createFetch({ baseURL: 'https://api.example.com' });
    const result = await api.get('/users/1', { schema: userSchema });

    expect(result.data).toEqual(mockResponse);
    expect(result.error).toBeNull();
  });

  it('zod 스키마를 사용한 요청 검증 실패', async () => {
    const mockResponse = {
      id: 1,
      name: 'Test User',
      email: 'invalid-email', // 유효하지 않은 이메일
    };

    // 응답 모킹
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': 'application/json',
      }),
      json: async () => mockResponse,
    });

    // Zod 스키마 정의
    const userSchema = z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email(),
    });

    const api = createFetch({ baseURL: 'https://api.example.com' });
    const result = await api.get('/users/1', { schema: userSchema });

    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.error?.message).toBe('Validation failed');
    expect(result.error?.validation).toBeDefined();
    expect(result.error?.raw).toEqual(mockResponse);
  });

  it('요청 인터셉터 작동 확인', async () => {
    // 응답 모킹
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': 'application/json',
      }),
      json: async () => ({}),
    });

    const api = createFetch({ baseURL: 'https://api.example.com' });

    // 인터셉터 추가
    api.interceptors.request.use((config) => {
      return {
        ...config,
        headers: {
          ...config.headers,
          Authorization: 'Bearer test-token',
        },
      };
    });

    await api.get('/users');

    expect(mockFetch).toHaveBeenCalledTimes(1);

    // 두 번째 인자는 요청 옵션
    const requestInit = mockFetch.mock.calls[0][1];
    expect(requestInit.headers['Authorization']).toBe('Bearer test-token');
  });

  it('응답 인터셉터 작동 확인', async () => {
    const mockResponse = { data: { id: 1, name: 'Test' } };

    // 응답 모킹
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': 'application/json',
      }),
      json: async () => mockResponse,
    });

    const api = createFetch({ baseURL: 'https://api.example.com' });

    // 인터셉터 추가 - 응답에서 data 프로퍼티만 추출
    api.interceptors.response.use((response) => {
      if (response && typeof response === 'object' && 'data' in response) {
        return response.data;
      }
      return response;
    });

    const result = await api.get('/users/1');

    expect(result.data).toEqual({ id: 1, name: 'Test' });
  });

  it('오류 처리', async () => {
    // 네트워크 오류 모킹
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const api = createFetch({ baseURL: 'https://api.example.com' });
    const result = await api.get('/users/1');

    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.error?.message).toBe('Network error');
  });

  it('config 객체 내 스키마 통합 테스트', async () => {
    const mockResponse = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    };

    // 응답 모킹
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': 'application/json',
      }),
      json: async () => mockResponse,
    });

    // Zod 스키마 정의
    const userSchema = z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email(),
    });

    const api = createFetch({ baseURL: 'https://api.example.com' });

    // 새로운 API 형식 테스트 - config 객체 내에 schema 포함
    const result = await api.get('/users/1', {
      schema: userSchema,
      headers: {
        'X-Test-Header': 'test-value',
      },
    });

    expect(result.data).toEqual(mockResponse);
    expect(result.error).toBeNull();

    // 두 번째 인자는 요청 옵션
    const requestInit = mockFetch.mock.calls[0][1];
    expect(requestInit.headers['X-Test-Header']).toBe('test-value');
  });
});
