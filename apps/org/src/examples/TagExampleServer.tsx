import { get } from '../lib/api';
import TagRevalidateButton from './components/TagRevalidateButton';
import CacheExpiryTimer from './components/CacheExpiryTimer';

interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  status?: string;
}

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
  views?: number;
  likes?: number;
}

interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
  rating?: number;
  createdAt?: string;
}

/**
 * 서버 컴포넌트에서 태그 기반 캐싱을 사용하는 예제
 * Next.js 15에서 서버 측 데이터 가져오기, 캐싱 및 재검증을 보여줍니다.
 */
export async function TagExampleServer() {
  // 각 API 요청별 데이터 변수 정의
  let users: User[] = [];
  let posts: Post[] = [];
  let comments: Comment[] = [];

  // 데이터 로딩 시간을 기록
  const loadTime = new Date().toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // 현재 타임스탬프 (밀리초)를 기록
  const currentTimestamp = Date.now();

  try {
    // 사용자 목록 - 'users' 태그로 캐싱
    users = await get<User[]>('/users', {
      revalidate: 30, // 30초 캐싱
      tags: ['users'], // 'users' 태그 적용
      params: { _limit: 3 }, // 3명의 사용자만 가져오기
      cache: 'force-cache', // 명시적 캐싱 활성화
    });
  } catch (error) {
    console.error('사용자 데이터 가져오기 실패:', error);
    users = [];
  }

  try {
    // 게시물 목록 - 'posts' 태그로 캐싱
    posts = await get<Post[]>('/posts', {
      revalidate: 30, // 30초 캐싱
      tags: ['posts'], // 'posts' 태그 적용
      params: { _limit: 3 }, // 3개의 게시물만 가져오기
      cache: 'force-cache', // 명시적 캐싱 활성화
    });
  } catch (error) {
    console.error('게시물 데이터 가져오기 실패:', error);
    posts = [];
  }

  try {
    // 댓글 목록 - 'posts'와 'comments' 태그로 캐싱 (다중 태그)
    comments = await get<Comment[]>('/comments', {
      revalidate: 30, // 30초 캐싱
      tags: ['posts', 'comments'], // 다중 태그 적용
      params: { _limit: 5 }, // 5개의 댓글만 가져오기
      cache: 'force-cache', // 명시적 캐싱 활성화
    });
  } catch (error) {
    console.error('댓글 데이터 가져오기 실패:', error);
    comments = [];
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <div className="bg-green-50 p-3 rounded-lg mb-4 text-sm">
        <p>이 컴포넌트는 서버 컴포넌트로 렌더링되었습니다.</p>
        <p>
          Next.js 15의 캐싱 시스템과 태그 기반 재검증을 활용하는 방법을
          보여줍니다.
        </p>
        <div className="mt-2 text-xs text-gray-600">
          <span className="font-medium">데이터 로딩 시간:</span> {loadTime} -{' '}
          <span className="font-medium text-blue-600">
            이 시간이 바뀌지 않으면 캐시된 데이터를 사용 중입니다. 새로고침
            후에도 같은 시간이 표시되면 캐싱이 정상 작동 중입니다.
          </span>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-4">
        태그 기반 캐싱 (서버 컴포넌트)
      </h1>

      {/* 캐시 타이머 */}
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h2 className="text-lg font-semibold mb-2">캐시 상태 및 만료 타이머</h2>
        <p className="text-sm mb-3">
          데이터는 30초 동안 캐싱됩니다. 아래 타이머는 캐시가 만료되는 시간을
          보여줍니다.
          <span className="block text-blue-600 mt-1">
            캐시 만료 시 자동으로 페이지가 새로고침됩니다.
          </span>
          <span className="block text-gray-600 mt-1 italic">
            참고: 개발 환경에서는 캐싱 시간이 정확하지 않을 수 있으며, 시스템
            상태에 따라 실제 캐싱 시간이 달라질 수 있습니다.
          </span>
        </p>
        <CacheExpiryTimer
          loadTimestamp={currentTimestamp}
          cacheDuration={30}
          autoRefresh={true}
        />
      </div>

      {/* 재검증 버튼 그룹 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">데이터 재검증</h2>
        <p className="text-sm mb-3">
          다음 버튼을 클릭하여 해당 태그의 데이터를 재검증할 수 있습니다.
        </p>
        <div className="flex flex-wrap gap-4">
          <TagRevalidateButton
            tags={['users']}
            label="사용자 재검증"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          />
          <TagRevalidateButton
            tags={['posts']}
            label="게시물 재검증"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          />
          <TagRevalidateButton
            tags={['comments']}
            label="댓글 재검증"
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          />
          <TagRevalidateButton
            tags={['users', 'posts', 'comments']}
            label="모든 데이터 재검증"
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
            autoRefresh={true}
          />
        </div>
        <div className="mt-4 bg-blue-50 p-3 rounded-md text-sm">
          <p className="font-semibold">재검증 작동 방식 안내:</p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>버튼을 클릭하면 서버 캐시가 재검증됩니다</li>
            <li>새로운 데이터를 보려면 페이지를 새로고침해야 합니다</li>
            <li>
              <strong>모든 데이터 재검증</strong> 버튼은 재검증 후 자동으로
              페이지를 새로고침합니다
            </li>
            <li>각 버튼에 마지막 재검증 시간이 표시됩니다</li>
          </ol>
          <p className="mt-2 font-semibold text-blue-700">캐싱 확인 방법:</p>
          <ol className="list-decimal pl-5 mt-1 space-y-1 text-blue-800">
            <li>
              페이지 상단의 <strong>데이터 로딩 시간</strong>을 확인하세요
            </li>
            <li>
              페이지를 <strong>새로고침(F5)</strong>해도 같은 시간이 표시되면
              캐싱이 작동 중입니다
            </li>
            <li>
              타이머가 <strong>만료된 후 새로고침</strong>하거나,{' '}
              <strong>재검증 버튼 클릭 후 새로고침</strong>하면 시간이
              업데이트됩니다
            </li>
          </ol>
        </div>
      </div>

      {/* 데이터 표시 섹션: 사용자 */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          사용자 목록{' '}
          <span className="text-sm font-normal">
            (30초 캐싱, &apos;users&apos; 태그)
          </span>
        </h2>
        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
          <span>마지막 데이터 로드: {loadTime}</span>
          <span>
            서버 타임스탬프:{' '}
            {new Date(currentTimestamp).toLocaleTimeString('ko-KR')}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {users.map((user) => (
            <div key={user.id} className="border rounded-lg p-4 bg-blue-50">
              <div className="font-medium text-lg">{user.name}</div>
              <div className="text-gray-600">{user.email}</div>
              {user.status && (
                <div className="text-sm mt-1">상태: {user.status}</div>
              )}
              <div className="text-sm text-gray-500 mt-2">ID: {user.id}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 데이터 표시 섹션: 게시물 */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          게시물 목록{' '}
          <span className="text-sm font-normal">
            (30초 캐싱, &apos;posts&apos; 태그)
          </span>
        </h2>
        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
          <span>마지막 데이터 로드: {loadTime}</span>
          <span>
            서버 타임스탬프:{' '}
            {new Date(currentTimestamp).toLocaleTimeString('ko-KR')}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {posts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4 bg-green-50">
              <div className="font-medium text-lg">{post.title}</div>
              <div className="text-gray-600 mb-2">{post.body}</div>
              <div className="text-sm text-gray-500">
                게시물 ID: {post.id} | 작성자 ID: {post.userId}
              </div>
              {post.views !== undefined && post.likes !== undefined && (
                <div className="mt-2 text-sm flex gap-3">
                  <span className="text-blue-600">조회수: {post.views}</span>
                  <span className="text-red-600">좋아요: {post.likes}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 데이터 표시 섹션: 댓글 */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          댓글 목록{' '}
          <span className="text-sm font-normal">
            (30초 캐싱, &apos;comments&apos; 및 &apos;posts&apos; 태그)
          </span>
        </h2>
        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
          <span>마지막 데이터 로드: {loadTime}</span>
          <span>
            서버 타임스탬프:{' '}
            {new Date(currentTimestamp).toLocaleTimeString('ko-KR')}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="border rounded-lg p-3 bg-purple-50"
            >
              <div className="font-medium">{comment.name}</div>
              <div className="text-gray-600 mb-2">{comment.body}</div>
              <div className="text-sm text-gray-500">
                댓글 ID: {comment.id} | 게시물 ID: {comment.postId}
              </div>
              {comment.rating !== undefined && (
                <div className="mt-1 text-sm">
                  평점: {'★'.repeat(comment.rating)}
                  {'☆'.repeat(5 - comment.rating)}
                </div>
              )}
              {comment.createdAt && (
                <div className="text-xs text-gray-500 mt-1">
                  작성 시간:{' '}
                  {new Date(comment.createdAt).toLocaleTimeString('ko-KR')}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm">
        <h3 className="font-bold mb-2">태그 기반 캐싱 작동 방식:</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>태그 지정:</strong> API 요청에{' '}
            <code className="bg-blue-100 px-1 rounded">
              tags: [&apos;태그명&apos;]
            </code>
            을 지정합니다.
          </li>
          <li>
            <strong>데이터 캐싱:</strong> 지정된 시간 동안 캐시됩니다. 예:{' '}
            <code className="bg-blue-100 px-1 rounded">revalidate: 60</code>{' '}
            (60초)
          </li>
          <li>
            <strong>캐시 전략 설정:</strong>{' '}
            <code className="bg-blue-100 px-1 rounded">
              cache: &apos;force-cache&apos;
            </code>
            로 명시적 캐싱을 활성화합니다. 다른 옵션:{' '}
            <code className="bg-blue-100 px-1 rounded">
              &apos;no-store&apos;
            </code>
            (캐싱 없음),{' '}
            <code className="bg-blue-100 px-1 rounded">
              &apos;no-cache&apos;
            </code>
            (검증 필요)
          </li>
          <li>
            <strong>태그 기반 재검증:</strong> 서버 액션에서{' '}
            <code className="bg-blue-100 px-1 rounded">
              revalidateTag(&apos;태그명&apos;)
            </code>
            으로 특정 태그의 모든 데이터를 재검증합니다.
          </li>
          <li>
            <strong>다중 태그:</strong> 여러 태그를 지정하면 (
            <code className="bg-blue-100 px-1 rounded">
              tags: [&apos;태그1&apos;, &apos;태그2&apos;]
            </code>
            ) 관련된 모든 태그가 재검증됩니다.
          </li>
        </ol>
        <div className="mt-4">
          <strong>구현 예시:</strong>
          <pre className="bg-gray-800 text-white p-2 rounded mt-1 overflow-x-auto text-xs">
            {`// 서버 액션에서 태그 재검증
&apos;use server&apos;
import { revalidateTag } from &apos;next/cache&apos;;

export async function refreshData(tag: string) {
  revalidateTag(tag);
  return { success: true };
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default TagExampleServer;
