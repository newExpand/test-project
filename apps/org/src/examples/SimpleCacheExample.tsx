'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

/**
 * 기본 fetch를 사용해 캐싱을 테스트하는 컴포넌트
 */
export default function SimpleCacheExample({
  serverComponent,
}: {
  serverComponent: React.ReactNode;
}) {
  const [loadTime, setLoadTime] = useState<string>('로딩 중...');
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const router = useRouter();

  // 타이머 설정
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsExpired(true);
    }
  }, [timeLeft]);

  // 페이지 새로고침
  const refreshPage = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      router.refresh();
    }, 1000);
  };

  // 서버 시간 가져오기 (초기 로드시)
  useEffect(() => {
    // 현재 시간 설정
    const now = new Date();
    setLoadTime(
      now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    );
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Next.js 기본 fetch를 사용한 캐싱 예제
        </h1>
        <p className="text-sm text-gray-600 mb-2">
          이 예제는 Next.js의 기본 fetch API와 기본 캐싱 동작을 보여줍니다.
        </p>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-blue-700 font-medium">
              클라이언트 로드 시간: {loadTime}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshPage}
              disabled={isRefreshing}
              className={`px-4 py-2 rounded ${
                isRefreshing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isRefreshing ? '새로고침 중...' : '수동 새로고침'}
            </button>
          </div>
        </div>
      </div>

      {/* 캐시 타이머 */}
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">캐시 타이머</h2>
        <div className="flex justify-between mb-2">
          <span>캐시 상태:</span>
          <span
            className={`font-medium ${
              isExpired ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {isExpired ? '만료됨' : '유효함'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div
            className={`h-2.5 rounded-full ${
              isExpired
                ? 'bg-red-600'
                : timeLeft < 10
                ? 'bg-orange-500'
                : 'bg-green-600'
            }`}
            style={{
              width: `${isExpired ? 0 : (timeLeft / 30) * 100}%`,
            }}
          ></div>
        </div>
        <div className="flex justify-between text-sm">
          <span>남은 시간:</span>
          <span
            className={`font-medium ${
              isExpired
                ? 'text-red-600'
                : timeLeft < 10
                ? 'text-orange-600'
                : 'text-green-600'
            }`}
          >
            {isExpired ? '캐시 만료됨' : `${timeLeft}초`}
          </span>
        </div>
        {isExpired && (
          <div className="mt-2 p-2 bg-red-100 text-red-800 text-sm rounded">
            <p>
              캐시가 만료되었습니다. 새로고침을 하면 서버에서 새로운 데이터를
              가져옵니다.
            </p>
            <button
              onClick={refreshPage}
              className="mt-2 w-full py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              지금 새로고침
            </button>
          </div>
        )}
      </div>

      {/* 서버 데이터 섹션 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-xl font-semibold">서버에서 가져온 데이터</h2>
          <p className="text-sm text-gray-600">
            이 데이터는 서버 컴포넌트에서 30초 동안 캐싱됩니다.
          </p>
        </div>
        <div className="p-4">
          {/* 서버 컴포넌트를 props로 받아 렌더링 */}
          {serverComponent}
        </div>
      </div>

      <div className="mt-6 bg-gray-50 p-4 rounded-lg text-sm">
        <h3 className="font-bold mb-2">캐싱 작동 방식:</h3>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            서버 컴포넌트에서 <code className="bg-gray-200 px-1">fetch</code>{' '}
            또는 <code className="bg-gray-200 px-1">get</code> 함수를 사용하여
            데이터를 불러옵니다.
          </li>
          <li>
            <code className="bg-gray-200 px-1">next: {'{revalidate: 30}'}</code>{' '}
            또는 <code className="bg-gray-200 px-1">revalidate: 30</code>{' '}
            옵션으로 30초 동안 캐싱합니다.
          </li>
          <li>
            <code className="bg-gray-200 px-1">tags: [&apos;posts&apos;]</code>{' '}
            옵션으로 태그 기반 캐싱을 활성화합니다.
          </li>
          <li>
            타이머가 만료되거나 &apos;새로고침&apos; 버튼을 클릭하면 캐시가
            재검증됩니다.
          </li>
          <li>
            서버 데이터 섹션에서 데이터 로드 시간과 현재 시간을 비교하여 캐싱
            상태를 확인할 수 있습니다.
          </li>
        </ol>
      </div>
    </div>
  );
}

/**
 * 서버 컴포넌트 - 실제 데이터 가져오기
 */
async function FetchedData() {
  // 현재 시간 가져오기 (로딩 시간 표시용)
  const loadTime = new Date().toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // fetch 옵션으로 30초 캐싱 설정
  const fetchOptions = {
    next: { revalidate: 30 },
    cache: 'force-cache' as RequestCache,
  };

  try {
    // 포스트 데이터 가져오기
    const res = await fetch(
      'http://localhost:3333/api/posts?_limit=3',
      fetchOptions
    );

    if (!res.ok) {
      throw new Error('데이터를 가져오는데 실패했습니다');
    }

    const posts = (await res.json()) as Post[];

    return (
      <div>
        <div className="mb-4 text-sm bg-green-50 p-3 rounded-lg">
          <p className="font-medium">데이터 로딩 시간: {loadTime}</p>
          <p className="mt-1 text-gray-600">
            같은 시간이 계속 표시되면 캐시된 데이터를 사용 중입니다. 새로고침
            후에도 같은 시간이 표시되면 캐싱이 작동 중이며, 다른 시간이 표시되면
            새로운 데이터가 로드된 것입니다.
          </p>
        </div>

        <h3 className="text-lg font-semibold mb-3">포스트 목록</h3>
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4 bg-blue-50">
              <div className="font-medium text-lg">{post.title}</div>
              <div className="text-gray-600 mt-1">{post.body}</div>
              <div className="text-xs text-gray-500 mt-2">
                포스트 ID: {post.id} | 작성자 ID: {post.userId}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        <p>에러: 데이터를 불러오지 못했습니다.</p>
        <p className="text-sm mt-1">
          {error instanceof Error ? error.message : '알 수 없는 오류'}
        </p>
      </div>
    );
  }
}
