import { getUsers } from '@/lib/api';
import UserNav from './nav';

// 기본 캐싱 사용 (ISR 방식)
export const revalidate = 30; // 30초마다 재검증

export default async function UsersPage() {
  // 캐시 태그를 이용해 데이터 가져오기
  const result = await getUsers({
    revalidate: 30,
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
      <h1 className="text-3xl font-bold mb-6">사용자 목록 (캐싱 테스트)</h1>

      <UserNav />

      <div className="bg-blue-50 p-4 rounded-lg mb-6">
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
          <strong>재검증 설정:</strong> {revalidate}초
        </p>
      </div>

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
