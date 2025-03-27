'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { backendApi } from '@/lib/api';

/**
 * 사용자 데이터 캐시를 태그 기반으로 재검증합니다.
 * 먼저 백엔드 API를 호출하여 데이터를 업데이트한 다음,
 * Next.js 캐시를 무효화합니다.
 */
export async function revalidateUserData() {
  try {
    // 1. 백엔드 API 호출하여 데이터 갱신
    await backendApi.put('/users/revalidate');

    // 2. Next.js 캐시 태그 무효화
    revalidateTag('users');

    return { success: true, message: '데이터가 성공적으로 재검증되었습니다.' };
  } catch (error) {
    console.error('데이터 재검증 오류:', error);
    return {
      success: false,
      error: '데이터 재검증 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 사용자 경로를 재검증합니다.
 * 캐시 태그가 없는 경우 이 방식을 사용할 수 있습니다.
 */
export async function revalidateUserPages() {
  try {
    // 1. 백엔드 API 호출하여 데이터 갱신
    await backendApi.put('/users/revalidate');

    // 2. Next.js 캐시 경로 무효화
    revalidatePath('/users');

    return {
      success: true,
      message: '사용자 페이지가 성공적으로 재검증되었습니다.',
    };
  } catch (error) {
    console.error('페이지 재검증 오류:', error);
    return {
      success: false,
      error: '페이지 재검증 중 오류가 발생했습니다.',
    };
  }
}
