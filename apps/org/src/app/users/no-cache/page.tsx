import { getUsers } from '@/lib/api';
import UserNav from '../nav';

// 캐싱 없이 항상 새로운 데이터를 요청
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function UsersNoCachePage() {
  // no-cache 옵션을 사용하면서 태그 지정
  const result = await getUsers({
    cache: 'no-store',
  });

  if (result.error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          사용자 데이터 로딩 오류
        </h1>
        <p>{result.error.message}</p>
      </div>
    );
  }

  const { users, lastUpdated, timestamp } = result.data;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">사용자 목록 (캐싱 없음)</h1>

      <UserNav />

      <div className="bg-yellow-50 p-4 rounded-lg mb-6">
        <p>
          <strong>마지막 업데이트:</strong>{' '}
          {new Date(lastUpdated).toLocaleString()}
        </p>
        <p>
          <strong>요청 시간:</strong> {timestamp}
        </p>
        <p>
          <strong>페이지 생성 시간:</strong> {new Date().toLocaleString()}
        </p>
        <p>
          <strong>캐싱 설정:</strong> 캐싱 없음 (매 요청마다 새로 가져옴)
        </p>
      </div>

      <p className="mb-4">
        이 페이지는 <code>cache: &apos;no-store&apos;</code> 옵션을 사용하여 매
        요청마다 새로운 데이터를 가져옵니다. 새로고침할 때마다 사용자 순서가
        변경되어야 합니다.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="border rounded-lg p-4 bg-white shadow-sm"
          >
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-gray-500 text-sm mt-2">ID: {user.id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
