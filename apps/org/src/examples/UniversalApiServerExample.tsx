import { get } from '../lib/api';

interface User {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

interface Profile {
  userId: number;
  username: string;
}

/**
 * 서버 컴포넌트에서 통합 API를 사용하는 예제
 * Next.js 15에서의 캐싱 설정 예시를 보여줍니다.
 */
export async function UniversalApiServerExample() {
  let todos: User[] = [];
  let posts: Post[] = [];
  let profile: Profile | null = null;

  try {
    // 예제 1: 최상위 레벨 속성으로 캐싱 설정
    // - revalidate: 30초 동안 캐싱
    // - tags: 'todos' 태그로 선택적 재검증 가능
    // Next.js가 이러한 패턴을 지원하지만, next 객체 사용이 더 표준적입니다.
    todos = await get<User[]>('/todos', {
      revalidate: 30,
      tags: ['todos'],
      params: { _limit: 3 },
      cache: 'force-cache', // 명시적으로 캐싱 활성화
    });
  } catch (error) {
    console.error('API 요청 실패 (todos):', error);
    todos = [];
  }

  try {
    // 예제 2: next 객체로 캐싱 정책 설정 (권장 방식)
    // Next.js의 표준 타입 시스템과 완전히 호환됨
    posts = await get<Post[]>('/posts', {
      params: { _limit: 3 },
      cache: 'force-cache', // 캐싱 활성화
      next: {
        revalidate: 30, // 30초 동안 캐싱
        tags: ['posts'], // 'posts' 태그로 선택적 재검증 가능
      },
    });
  } catch (error) {
    console.error('API 요청 실패 (posts):', error);
    posts = [];
  }

  try {
    // 예제 3: 캐싱하지 않음 (기본값 - Next.js 15)
    // 인증 관련 API는 캐싱하지 않는 것이 안전
    profile = await get<Profile>('/auth/profile', {
      // Next.js 15에서는 기본적으로 cache: 'no-store'가 적용됨
      // 명시적으로 지정할 수도 있음: cache: 'no-store'
    });
  } catch (error) {
    console.error('API 요청 실패 (profile):', error);
    profile = { userId: 1, username: '사용자 (더미 데이터)' };
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
      <div className="bg-green-50 p-3 rounded-lg mb-4 text-sm">
        <p>이 컴포넌트는 서버 컴포넌트로 렌더링되었습니다.</p>
        <p>
          클라이언트 컴포넌트와 동일한 API 모듈을 사용하지만 서버에서 직접
          데이터를 가져옵니다.
        </p>
      </div>

      <h1 className="text-2xl font-bold mb-4">통합 API 서버 예제</h1>

      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">
          사용자 프로필
          <span className="text-sm font-normal ml-2">
            (인증 API, 캐싱하지 않음)
          </span>
        </h2>
        {profile ? (
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 rounded-full p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium">{profile.username}</p>
              <p className="text-sm text-gray-600">
                사용자 ID: {profile.userId}
              </p>
              <p className="text-xs text-red-500 mt-1">
                * 참고: 인증이 필요한 실제 엔드포인트
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic">프로필을 불러올 수 없습니다.</p>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          할일 목록{' '}
          <span className="text-sm font-normal">
            (30초 캐싱, &apos;todos&apos; 태그)
          </span>
        </h2>
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={`p-3 border rounded ${
                todo.completed ? 'bg-gray-100' : ''
              }`}
            >
              <p className="font-medium">{todo.title}</p>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">사용자 ID: {todo.userId}</span>
                <span
                  className={`${
                    todo.completed ? 'text-green-600' : 'text-yellow-600'
                  }`}
                >
                  {todo.completed ? '완료됨' : '진행 중'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">
          게시물{' '}
          <span className="text-sm font-normal">
            (30초 캐싱, &apos;posts&apos; 태그)
          </span>
        </h2>
        {posts.length > 0 ? (
          <ul className="space-y-3">
            {posts.map((post) => (
              <li key={post.id} className="p-3 border rounded">
                <p className="font-medium">{post.title}</p>
                <p className="text-gray-700 text-sm mt-1">
                  {post.body.substring(0, 100)}...
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">게시물을 불러올 수 없습니다.</p>
        )}
      </div>

      <div className="mt-6 p-3 bg-blue-50 rounded-lg text-sm">
        <h3 className="font-bold mb-2">Next.js 15 캐싱 타입 시스템:</h3>
        <pre className="bg-gray-800 text-white p-2 rounded overflow-x-auto">
          {`// Next.js 15에서 fetch 옵션의 타입 정의
interface RequestInit {
  // 다른 표준 fetch 옵션들...
  cache?: 'force-cache' | 'no-store'; // 캐싱 정책
  next?: NextFetchRequestConfig;      // Next.js 전용 옵션
}

// Next.js 전용 옵션 타입
interface NextFetchRequestConfig {
  revalidate?: number | false;        // 재검증 시간(초)
  tags?: string[];                    // 태그 기반 재검증
}

// 사용 예시:
const res1 = await fetch('/api/data', {
  next: { revalidate: 60 }            // 권장 방식 
});

// 호환성을 위한 대체 패턴 (두 방식 모두 작동함)
const res2 = await fetch('/api/data', {
  revalidate: 60                      // 최상위 레벨 (호환성 지원)
});`}
        </pre>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p>
          이 데이터는 서버에서 가져온 후 HTML로 변환되어 클라이언트로
          전송됩니다. 클라이언트에서 추가 API 요청이 필요하지 않습니다.
        </p>
      </div>
    </div>
  );
}

export default UniversalApiServerExample;
