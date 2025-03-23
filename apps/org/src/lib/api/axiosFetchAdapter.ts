import {
  AxiosAdapter,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';

interface NextConfig {
  revalidate?: number;
  tags?: string[];
}

interface FetchOptions extends RequestInit {
  next: NextConfig;
  cache?: RequestCache;
}

/**
 * Axios에 fetch API를 어댑터로 사용하는 함수
 *
 * Next.js 15의 fetch 캐싱 기능을 활용할 수 있게 해줍니다.
 *
 * @param config Axios 요청 설정
 * @returns Axios 응답 객체를 포함한 Promise
 */
export const fetchAdapter: AxiosAdapter = async (
  config: InternalAxiosRequestConfig
): Promise<AxiosResponse> => {
  const url = buildRequestUrl(config);
  const { fetchOptions, headers } = prepareFetchOptions(config);

  if (config.method !== 'GET') {
    await setupRequestBody(config, fetchOptions, headers);
  }

  try {
    const response = await fetch(url, fetchOptions);
    const data = await parseResponseData(response);
    const axiosResponse = createAxiosResponse(response, data, config);

    if (!response.ok) {
      throw createAxiosError(response, config, axiosResponse);
    }

    return axiosResponse;
  } catch (error) {
    if (error instanceof Error && !(error instanceof AxiosError)) {
      throw new AxiosError(error.message, 'FETCH_ERROR', config, null);
    }

    throw error;
  }
};

/**
 * 요청 URL 생성
 */
function buildRequestUrl(config: InternalAxiosRequestConfig): string {
  if (!config.baseURL) {
    return config.url || '';
  }

  // URL 중복 슬래시 제거하며 병합
  return (config.baseURL + (config.url || '')).replace(/([^:]\/)\/+/g, '$1');
}

/**
 * fetch 요청 옵션 준비
 */
function prepareFetchOptions(config: InternalAxiosRequestConfig) {
  const cacheConfig = extractCacheConfig(config.headers);
  const headers = extractHeaders(config.headers);

  const fetchOptions: FetchOptions = {
    method: config.method?.toUpperCase() || 'GET',
    headers,
    signal: config.signal as AbortSignal | null,
    credentials: config.withCredentials ? 'include' : undefined,
    cache: cacheConfig.revalidate ? 'force-cache' : 'no-store',
    next: {}, // 빈 객체로 초기화
  };

  // 캐싱 설정 적용
  if (cacheConfig.revalidate) {
    fetchOptions.next.revalidate = cacheConfig.revalidate;
  }

  if (cacheConfig.tags?.length) {
    fetchOptions.next.tags = cacheConfig.tags;
  }

  return { fetchOptions, headers };
}

/**
 * 캐싱 설정 추출
 */
function extractCacheConfig(
  headers?: Record<string, any>
): NextFetchRequestConfig {
  if (!headers) return {};

  const revalidate = headers['x-revalidate']
    ? Number(headers['x-revalidate'])
    : undefined;

  const tags = headers['x-nextjs-tags']
    ? headers['x-nextjs-tags'].split(',')
    : undefined;

  return { revalidate, tags };
}

/**
 * 헤더 정보 추출 (캐싱 관련 헤더 제외)
 */
function extractHeaders(headers?: Record<string, any>): Record<string, string> {
  const result: Record<string, string> = {};
  if (!headers) return result;

  Object.entries(headers).forEach(([key, value]) => {
    // 캐싱 관련 헤더 제외
    if (
      key !== 'x-revalidate' &&
      key !== 'x-nextjs-tags' &&
      typeof value === 'string'
    ) {
      result[key] = value;
    }
  });

  return result;
}

/**
 * 요청 바디 설정
 */
async function setupRequestBody(
  config: InternalAxiosRequestConfig,
  fetchOptions: FetchOptions,
  headers: Record<string, string>
) {
  if (!config.data) return;

  // FormData 처리
  if (config.data instanceof FormData) {
    fetchOptions.body = config.data;
    delete headers['Content-Type']; // 브라우저가 자동으로 boundary 설정
    return;
  }

  // JSON 데이터 처리
  try {
    fetchOptions.body = convertToJsonBody(config.data);

    // Content-Type 헤더가 없으면 추가
    if (!headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json';
    }
  } catch (err) {
    // 직렬화에 실패한 경우 원본 데이터 그대로 사용
    fetchOptions.body = config.data as BodyInit;
  }
}

/**
 * 데이터를 JSON 문자열로 변환
 */
function convertToJsonBody(data: any): string {
  // 이미 문자열인 경우
  if (typeof data === 'string') {
    try {
      // 유효한 JSON인지 확인
      JSON.parse(data);
      return data;
    } catch (e) {
      // 유효한 JSON이 아니면 직렬화
      return JSON.stringify(data);
    }
  }

  // 객체를 JSON으로 직렬화
  return JSON.stringify(data);
}

/**
 * 응답 데이터 파싱
 */
async function parseResponseData(response: Response): Promise<any> {
  const contentType = response.headers.get('Content-Type');

  // JSON 응답 처리
  if (contentType?.includes('application/json')) {
    try {
      const text = await response.text();
      if (text.trim() === '') return null;
      return JSON.parse(text);
    } catch {
      const clonedResponse = response.clone();
      return await clonedResponse.text();
    }
  }

  // 텍스트 응답 처리
  if (contentType?.includes('text/')) {
    return await response.text();
  }

  // 기타 응답 형식(바이너리 등) 처리
  return await response.blob();
}

/**
 * Axios 응답 객체 생성
 */
function createAxiosResponse(
  response: Response,
  data: any,
  config: InternalAxiosRequestConfig
): AxiosResponse {
  return {
    data,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    config,
    request: null,
  };
}

/**
 * Axios 에러 객체 생성
 */
function createAxiosError(
  response: Response,
  config: InternalAxiosRequestConfig,
  axiosResponse: AxiosResponse
): AxiosError {
  return new AxiosError(
    response.statusText || `Request failed with status ${response.status}`,
    String(response.status),
    config,
    null,
    axiosResponse
  );
}
