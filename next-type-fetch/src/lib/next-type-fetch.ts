import { z } from 'zod';
import {
  FetchConfig,
  RequestConfig,
  ZodResponse,
  NextTypeFetch,
  HttpMethod,
} from '../types/index.js';
import { createInterceptors } from './interceptors.js';
import {
  appendQueryParams,
  combineURLs,
  createTimeoutPromise,
  mergeConfigs,
  stringifyData,
} from './utils.js';

/**
 * Next.js App Router와 함께 사용할 수 있는 타입 안전한 fetch 클라이언트를 생성합니다.
 * @param defaultConfig 기본 설정
 * @returns fetch 클라이언트 인스턴스
 */
export function createFetch(defaultConfig: FetchConfig = {}): NextTypeFetch {
  const interceptors = createInterceptors();

  /**
   * 기본 요청 함수
   */
  async function request<T = any>(
    config: RequestConfig
  ): Promise<ZodResponse<T>> {
    try {
      // 스키마 추출 (요청 인터셉터 전에 제거)
      const schema = config.schema as z.ZodType<T> | undefined;
      delete config.schema;

      // 요청 인터셉터 실행
      const requestConfig = await interceptors.request.run(config);

      // URL 조합
      const url = combineURLs(requestConfig.baseURL, requestConfig.url);

      // URL에 쿼리 파라미터 추가
      const fullUrl = appendQueryParams(url, requestConfig.params);

      // 타임아웃 설정
      const timeoutResult = createTimeoutPromise(requestConfig.timeout);
      const controller = new AbortController();

      // 요청 옵션 구성
      const requestInit: RequestInit = {
        method: requestConfig.method || 'GET',
        headers: requestConfig.headers as Record<string, string>,
        signal: controller.signal,
        ...requestConfig,
      };

      // RequestConfig에서 fetch API와 관련 없는 속성 제거
      delete (requestInit as any).baseURL;
      delete (requestInit as any).params;
      delete (requestInit as any).timeout;
      delete (requestInit as any).parseJSON;
      delete (requestInit as any).retry;
      delete (requestInit as any).data;
      delete (requestInit as any).url;
      delete (requestInit as any).schema;

      // data가 있으면 요청 본문에 추가
      if (requestConfig.data !== undefined) {
        const contentType = requestConfig.headers?.['Content-Type'] || '';

        // JSON 콘텐츠 타입이거나 명시적으로 지정되지 않은 경우 JSON으로 변환
        if (!contentType || contentType.includes('application/json')) {
          requestInit.body = stringifyData(requestConfig.data);

          // Content-Type 헤더가 없는 경우 자동으로 추가
          if (!contentType && requestInit.headers) {
            (requestInit.headers as Record<string, string>)['Content-Type'] =
              'application/json';
          }
        } else if (
          typeof requestConfig.data === 'object' &&
          !(requestConfig.data instanceof FormData) &&
          !(requestConfig.data instanceof URLSearchParams)
        ) {
          // 문자열이 아닌 경우 stringify
          requestInit.body = stringifyData(requestConfig.data);
        } else {
          // 이미 문자열이거나 FormData 또는 URLSearchParams인 경우
          requestInit.body = requestConfig.data as
            | string
            | FormData
            | URLSearchParams
            | Blob;
        }
      }

      // 실제 fetch 요청 실행
      const fetchPromise = fetch(fullUrl, requestInit);

      // 타임아웃이 있으면 타임아웃 Promise와 함께 race
      const response = await (timeoutResult
        ? Promise.race([fetchPromise, timeoutResult.promise])
        : fetchPromise);

      // 응답 처리
      let responseData: any;

      // JSON 응답 파싱 (parseJSON 옵션이 명시적으로 false가 아닌 경우)
      if (
        requestConfig.parseJSON !== false &&
        response.headers.get('content-type')?.includes('application/json')
      ) {
        responseData = await response.json();
      } else {
        // 텍스트 또는 기타 형식으로 응답 처리
        responseData = await response.text();
      }

      // 응답 인터셉터 실행
      const processedResponse = await interceptors.response.run(responseData);

      // 스키마 검증 (스키마가 제공된 경우)
      if (schema) {
        try {
          const validatedData = schema.parse(processedResponse);

          return {
            data: validatedData,
            error: null,
            status: response.status,
            headers: response.headers,
          };
        } catch (validationError) {
          // 스키마 검증 실패
          if (validationError instanceof z.ZodError) {
            return {
              data: null,
              error: {
                message: 'Validation failed',
                status: response.status,
                validation: validationError,
                raw: processedResponse,
              },
            };
          } else {
            return {
              data: null,
              error: {
                message: 'Unknown validation error',
                status: response.status,
                raw: processedResponse,
              },
            };
          }
        }
      }

      // 스키마 없이 응답 반환
      return {
        data: processedResponse,
        error: null,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      // 에러 인터셉터 실행
      const processedError = await interceptors.response.runError(error);

      return {
        data: null,
        error: {
          message:
            processedError instanceof Error
              ? processedError.message
              : 'Request failed',
          raw: processedError,
        },
      };
    }
  }

  // HTTP 메서드별 래퍼 함수들
  const instance: NextTypeFetch = {
    defaults: { ...defaultConfig },
    interceptors: {
      request: {
        use: interceptors.request.use,
        eject: interceptors.request.eject,
      },
      response: {
        use: interceptors.response.use,
        eject: interceptors.response.eject,
      },
    },

    request,

    async get<T = any>(
      url: string,
      config: FetchConfig = {}
    ): Promise<ZodResponse<T>> {
      return request<T>(
        mergeConfigs(defaultConfig, {
          ...config,
          url,
          method: 'GET' as HttpMethod,
        })
      );
    },

    async post<T = any>(
      url: string,
      data?: any,
      config: FetchConfig = {}
    ): Promise<ZodResponse<T>> {
      return request<T>(
        mergeConfigs(defaultConfig, {
          ...config,
          url,
          method: 'POST' as HttpMethod,
          data,
        })
      );
    },

    async put<T = any>(
      url: string,
      data?: any,
      config: FetchConfig = {}
    ): Promise<ZodResponse<T>> {
      return request<T>(
        mergeConfigs(defaultConfig, {
          ...config,
          url,
          method: 'PUT' as HttpMethod,
          data,
        })
      );
    },

    async delete<T = any>(
      url: string,
      config: FetchConfig = {}
    ): Promise<ZodResponse<T>> {
      return request<T>(
        mergeConfigs(defaultConfig, {
          ...config,
          url,
          method: 'DELETE' as HttpMethod,
        })
      );
    },

    async patch<T = any>(
      url: string,
      data?: any,
      config: FetchConfig = {}
    ): Promise<ZodResponse<T>> {
      return request<T>(
        mergeConfigs(defaultConfig, {
          ...config,
          url,
          method: 'PATCH' as HttpMethod,
          data,
        })
      );
    },
  };

  return instance;
}
