'use server';

import { revalidateTag, revalidatePath } from 'next/cache';

/**
 * 'users' 태그가 지정된 모든 데이터를 재검증합니다.
 */
export async function refreshUsers() {
  try {
    revalidateTag('users');
    return { success: true, message: '사용자 데이터 재검증이 완료되었습니다.' };
  } catch (error) {
    console.error('사용자 데이터 재검증 실패:', error);
    return { success: false, message: '사용자 데이터 재검증에 실패했습니다.' };
  }
}

/**
 * 'posts' 태그가 지정된 모든 데이터를 재검증합니다.
 */
export async function refreshPosts() {
  try {
    revalidateTag('posts');
    return { success: true, message: '게시물 데이터 재검증이 완료되었습니다.' };
  } catch (error) {
    console.error('게시물 데이터 재검증 실패:', error);
    return { success: false, message: '게시물 데이터 재검증에 실패했습니다.' };
  }
}

/**
 * 특정 경로의 데이터를 재검증합니다.
 */
export async function refreshPath(path: string) {
  if (!path) {
    return { success: false, message: '유효한 경로를 지정해주세요.' };
  }

  try {
    revalidatePath(path);
    return {
      success: true,
      message: `'${path}' 경로의 데이터 재검증이 완료되었습니다.`,
    };
  } catch (error) {
    console.error(`'${path}' 경로 재검증 실패:`, error);
    return {
      success: false,
      message: `'${path}' 경로의 데이터 재검증에 실패했습니다.`,
    };
  }
}

/**
 * 여러 태그를 한 번에 재검증합니다.
 */
export async function refreshMultipleTags(tags: string[]) {
  if (!tags.length) {
    return {
      success: false,
      message: '재검증할 태그를 하나 이상 지정해주세요.',
    };
  }

  try {
    const results = tags.map((tag) => {
      try {
        revalidateTag(tag);
        return { tag, success: true };
      } catch (error) {
        console.error(`'${tag}' 태그 재검증 실패:`, error);
        return { tag, success: false };
      }
    });

    const allSuccess = results.every((result) => result.success);
    const message = allSuccess
      ? '모든 태그의 재검증이 완료되었습니다.'
      : '일부 태그의 재검증에 실패했습니다.';

    return { success: allSuccess, message, results };
  } catch (error) {
    console.error('다중 태그 재검증 실패:', error);
    return { success: false, message: '태그 재검증 중 오류가 발생했습니다.' };
  }
}

/**
 * 특정 태그를 재검증하는 서버 액션
 * @param tags 재검증할 태그 배열
 * @returns 재검증 결과
 */
export async function revalidateTagAction(tags: string[]) {
  try {
    // 모든 태그에 대해 재검증 실행
    for (const tag of tags) {
      revalidateTag(tag);
    }

    return {
      success: true,
      message: '데이터가 성공적으로 재검증되었습니다.',
      tags: tags,
    };
  } catch (error) {
    console.error('재검증 중 오류 발생:', error);
    return {
      success: false,
      message: '데이터 재검증 중 오류가 발생했습니다.',
      error: String(error),
    };
  }
}
