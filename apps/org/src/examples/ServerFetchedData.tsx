import axios from 'axios';
import { get } from '../lib/api';
import { cache } from 'react';

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
  views?: number;
  likes?: number;
}

type FetchOptions =
  | { cache: 'no-store' | 'no-cache' | 'force-cache' } // 캐싱(SSR)
  | { next: { revalidate?: number; tags?: string[] } };

// React.cache를 사용한 axios 요청 (revalidate 처리를 위한 방법)
const cachedAxiosGet = cache(async (url: string) => {
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    console.error('캐시된 axios 요청 오류:', error);
    throw error;
  }
});

/**
 * 서버 컴포넌트 - 실제 데이터 가져오기
 */
export default async function ServerFetchedData() {
  // 페이지 렌더링 시간 기록
  const startTime = new Date();
  const loadTimeStr = startTime.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // 양쪽 결과 저장
  let fetchPosts: Post[] = [];
  let getPosts: Post[] = [];
  let axiosPosts: Post[] = [];
  let axiosCachedPosts: Post[] = [];
  let fetchError = null;
  let getError = null;
  let axiosError = null;
  let axiosCachedError = null;

  // 기본 fetch로 데이터 가져오기
  try {
    const res = await fetch('http://localhost:3333/api/posts?_limit=3', {
      next: { revalidate: 30 },
      cache: 'force-cache',
    });

    if (!res.ok) {
      throw new Error(`상태 코드: ${res.status}`);
    }

    fetchPosts = await res.json();
  } catch (error) {
    console.error('기본 fetch 오류:', error);
    fetchError = error;
  }

  // 커스텀 get 함수로 데이터 가져오기 (공식 fetch 어댑터 사용)
  try {
    getPosts = await get<Post[]>('/posts', {
      revalidate: 30, // 30초 캐싱
      tags: ['posts'], // 'posts' 태그 적용
      params: { _limit: 3 }, // 3개의 게시물만 가져오기
      cache: 'force-cache', // 명시적 캐싱 활성화
    });
  } catch (error) {
    console.error('커스텀 get 함수 오류:', error);
    getError = error;
  }

  // axios로 데이터 가져오기 (fetch 어댑터 사용)
  try {
    const res = await axios.get('http://localhost:3333/api/posts?_limit=3', {
      adapter: 'fetch',
      fetchOptions: {
        cache: 'force-cache',
        next: { revalidate: 30 },
      } as FetchOptions,
    });

    axiosPosts = res.data;
  } catch (error) {
    console.error('axios 오류:', error);
    axiosError = error;
  }

  // React.cache로 감싼 axios 요청 (권장되는 대안 방식)
  try {
    axiosCachedPosts = await cachedAxiosGet(
      'http://localhost:3333/api/posts?_limit=3'
    );
  } catch (error) {
    console.error('캐시된 axios 오류:', error);
    axiosCachedError = error;
  }

  // 현재 서버 시간과 로드 시간의 차이 계산
  const now = new Date();
  const timeDiffInSeconds = Math.round(
    (now.getTime() - startTime.getTime()) / 1000
  );

  // 모든 방식이 실패한 경우
  if (fetchError && getError && axiosError && axiosCachedError) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        <h3 className="font-bold mb-2">
          데이터를 불러오는 중 오류가 발생했습니다
        </h3>
        <p className="text-sm mb-4">
          {fetchError instanceof Error ? fetchError.message : '알 수 없는 오류'}
        </p>
        <div className="border-t border-red-300 pt-2">
          <p className="font-semibold">get 함수 오류:</p>
          <p className="text-sm">
            {getError instanceof Error ? getError.message : '알 수 없는 오류'}
          </p>
        </div>
        <div className="border-t border-red-300 pt-2">
          <p className="font-semibold">axios 오류:</p>
          <p className="text-sm">
            {axiosError instanceof Error
              ? axiosError.message
              : '알 수 없는 오류'}
          </p>
        </div>
        <div className="border-t border-red-300 pt-2">
          <p className="font-semibold">캐시된 axios 오류:</p>
          <p className="text-sm">
            {axiosCachedError instanceof Error
              ? axiosCachedError.message
              : '알 수 없는 오류'}
          </p>
        </div>
        <p className="text-xs mt-2">
          API 서버가 실행 중인지 확인하세요 (http://localhost:3333)
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 렌더링 정보 */}
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
        <p>
          <span className="font-semibold">페이지 렌더링 시간:</span>{' '}
          {loadTimeStr}
        </p>
        <p className="text-xs mt-2 text-blue-600 font-medium">
          revalidate 설정: 30초 (fetch와 axios 모두)
        </p>
        <p className="text-xs mt-1">
          참고: 30초 후에 재방문하면 데이터가 revalidate됩니다. 같은 렌더링
          시간이 표시되면 컴포넌트가 캐싱된 것이고, 같은 데이터가 표시되면 API
          응답이 캐싱된 것입니다.
        </p>
      </div>

      {/* 기본 fetch 결과 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-600">
              서버 데이터 로드 시간:{' '}
              <span className="font-medium">{loadTimeStr}</span>
            </p>
            <p className="text-xs text-gray-500">
              로딩에 걸린 시간: {timeDiffInSeconds}초
            </p>
          </div>
          <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            기본 fetch API 사용
          </div>
        </div>

        {fetchError ? (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
            오류:{' '}
            {fetchError instanceof Error
              ? fetchError.message
              : '알 수 없는 오류'}
          </div>
        ) : (
          <div className="space-y-4">
            {fetchPosts.map((post) => (
              <div
                key={post.id}
                className="border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold">{post.title}</h3>
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                  {post.body}
                </p>
                <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                  <span>글 ID: {post.id}</span>
                  <div className="flex space-x-4">
                    {post.views !== undefined && (
                      <span className="flex items-center">
                        <span className="mr-1">👁️</span>
                        {post.views}
                      </span>
                    )}
                    {post.likes !== undefined && (
                      <span className="flex items-center">
                        <span className="mr-1">👍</span>
                        {post.likes}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* get 함수 결과 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-600">
              서버 데이터 로드 시간:{' '}
              <span className="font-medium">{loadTimeStr}</span>
            </p>
          </div>
          <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
            커스텀 get 함수 사용 (태그: posts)
          </div>
        </div>

        {getError ? (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
            오류:{' '}
            {getError instanceof Error ? getError.message : '알 수 없는 오류'}
          </div>
        ) : (
          <div className="space-y-4">
            {getPosts.map((post) => (
              <div
                key={post.id}
                className="border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold">{post.title}</h3>
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                  {post.body}
                </p>
                <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                  <span>글 ID: {post.id}</span>
                  <div className="flex space-x-4">
                    {post.views !== undefined && (
                      <span className="flex items-center">
                        <span className="mr-1">👁️</span>
                        {post.views}
                      </span>
                    )}
                    {post.likes !== undefined && (
                      <span className="flex items-center">
                        <span className="mr-1">👍</span>
                        {post.likes}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* axios 결과 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-600">
              서버 데이터 로드 시간:{' '}
              <span className="font-medium">{loadTimeStr}</span>
            </p>
          </div>
          <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
            axios fetch 어댑터 사용 (revalidate 미지원)
          </div>
        </div>

        {axiosError ? (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
            오류:{' '}
            {axiosError instanceof Error
              ? axiosError.message
              : '알 수 없는 오류'}
          </div>
        ) : (
          <div className="space-y-4">
            {axiosPosts.map((post) => (
              <div
                key={post.id}
                className="border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold">{post.title}</h3>
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                  {post.body}
                </p>
                <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                  <span>글 ID: {post.id}</span>
                  <div className="flex space-x-4">
                    {post.views !== undefined && (
                      <span className="flex items-center">
                        <span className="mr-1">👁️</span>
                        {post.views}
                      </span>
                    )}
                    {post.likes !== undefined && (
                      <span className="flex items-center">
                        <span className="mr-1">👍</span>
                        {post.likes}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 캐시된 axios 결과 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-600">
              서버 데이터 로드 시간:{' '}
              <span className="font-medium">{loadTimeStr}</span>
            </p>
          </div>
          <div className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
            React.cache로 감싼 axios (권장 방식)
          </div>
        </div>

        {axiosCachedError ? (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
            오류:{' '}
            {axiosCachedError instanceof Error
              ? axiosCachedError.message
              : '알 수 없는 오류'}
          </div>
        ) : (
          <div className="space-y-4">
            {axiosCachedPosts.map((post) => (
              <div
                key={post.id}
                className="border border-orange-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold">{post.title}</h3>
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                  {post.body}
                </p>
                <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                  <span>글 ID: {post.id}</span>
                  <div className="flex space-x-4">
                    {post.views !== undefined && (
                      <span className="flex items-center">
                        <span className="mr-1">👁️</span>
                        {post.views}
                      </span>
                    )}
                    {post.likes !== undefined && (
                      <span className="flex items-center">
                        <span className="mr-1">👍</span>
                        {post.likes}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
