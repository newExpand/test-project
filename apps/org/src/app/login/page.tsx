'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { post } from '../../lib/api';

/**
 * 로그인 페이지
 * 인증 테스트를 위한 간단한 로그인 페이지입니다.
 */
export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('사용자 이름과 비밀번호를 모두 입력해 주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // 정확한 API 경로로 로그인 요청 (baseURL에 이미 /api가 포함되어 있음)
      await post('/auth/login', { username, password });

      // 로그인 성공 시 예제 페이지로 리디렉션
      router.push('/examples/api');
    } catch (err: any) {
      console.error('로그인 오류:', err.response?.data || err.message);
      setError('로그인 실패: 사용자 이름 또는 비밀번호가 잘못되었습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            인증 테스트를 위한 페이지입니다
          </p>
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">오류: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="username" className="sr-only">
                사용자 이름
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="relative block w-full rounded-md border-0 p-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                placeholder="사용자 이름 (john 또는 maria)"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="relative block w-full rounded-md border-0 p-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                placeholder="비밀번호 (password123 또는 password456)"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-3 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-300"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">사용 가능한 계정:</p>
          <div className="mt-2 text-gray-700">
            <p>사용자: john | 비밀번호: password123</p>
            <p>사용자: maria | 비밀번호: password456</p>
          </div>
          <p className="mt-2 text-gray-600">
            <a
              href="/examples/api"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              예제 페이지로 돌아가기
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
