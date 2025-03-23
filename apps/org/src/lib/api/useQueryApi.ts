import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { get, post, put, patch, del } from './universalApi';
import { ApiOptions } from './types';

/**
 * GET 요청을 위한 React Query 훅
 * @param queryKey 쿼리 키 (React Query 캐싱용)
 * @param url API 엔드포인트
 * @param apiOptions API 옵션
 * @param queryOptions React Query 옵션
 */
export function useApiQuery<TData = unknown, TError = AxiosError>(
  queryKey: readonly unknown[],
  url: string,
  apiOptions?: ApiOptions,
  queryOptions?: Omit<
    UseQueryOptions<TData, TError, TData, readonly unknown[]>,
    'queryKey' | 'queryFn'
  >
): UseQueryResult<TData, TError> {
  return useQuery({
    queryKey,
    queryFn: async () => {
      return await get<TData>(url, apiOptions);
    },
    ...queryOptions,
  } as UseQueryOptions<TData, TError, TData, readonly unknown[]>);
}

/**
 * POST 요청을 위한 React Query 훅
 * @param url API 엔드포인트
 * @param options React Query 옵션
 */
export function useApiMutation<
  TData = unknown,
  TVariables = unknown,
  TError = AxiosError,
  TContext = unknown
>(
  url: string,
  options?: Omit<
    UseMutationOptions<TData, TError, TVariables, TContext>,
    'mutationFn'
  >
): UseMutationResult<TData, TError, TVariables, TContext> {
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      return await post<TData, TVariables>(url, variables);
    },
    ...options,
  });
}

/**
 * PUT 요청을 위한 React Query 훅
 * @param url API 엔드포인트
 * @param options React Query 옵션
 */
export function useApiPutMutation<
  TData = unknown,
  TVariables = unknown,
  TError = AxiosError,
  TContext = unknown
>(
  url: string,
  options?: Omit<
    UseMutationOptions<TData, TError, TVariables, TContext>,
    'mutationFn'
  >
): UseMutationResult<TData, TError, TVariables, TContext> {
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      return await put<TData, TVariables>(url, variables);
    },
    ...options,
  });
}

/**
 * PATCH 요청을 위한 React Query 훅
 * @param url API 엔드포인트
 * @param options React Query 옵션
 */
export function useApiPatchMutation<
  TData = unknown,
  TVariables = unknown,
  TError = AxiosError,
  TContext = unknown
>(
  url: string,
  options?: Omit<
    UseMutationOptions<TData, TError, TVariables, TContext>,
    'mutationFn'
  >
): UseMutationResult<TData, TError, TVariables, TContext> {
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      return await patch<TData, TVariables>(url, variables);
    },
    ...options,
  });
}

/**
 * DELETE 요청을 위한 React Query 훅
 * @param url API 엔드포인트
 * @param options React Query 옵션
 */
export function useApiDeleteMutation<
  TData = unknown,
  TVariables = unknown,
  TError = AxiosError,
  TContext = unknown
>(
  url: string,
  options?: Omit<
    UseMutationOptions<TData, TError, TVariables, TContext>,
    'mutationFn'
  >
): UseMutationResult<TData, TError, TVariables, TContext> {
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      return await del<TData>(url, { data: variables });
    },
    ...options,
  });
}
