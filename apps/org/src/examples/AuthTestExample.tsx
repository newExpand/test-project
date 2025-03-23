'use client';

import { useState, useEffect } from 'react';
import { get, post } from '../lib/api';
import { useRouter } from 'next/navigation';

/**
 * 인증 테스트 컴포넌트
 * 짧은 액세스 토큰 만료(10초) 및 자동 리프레시 기능을 테스트합니다.
 */
export default function AuthTestExample() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [requestCount, setRequestCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 로그인 여부 확인
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const response = await get<{ username: string; userId: number }>(
          '/auth/profile',
          { revalidate: 0 } // 캐싱 없이 매번 새로 요청
        );
        setIsLoggedIn(true);
        setMessage(`인증됨: ${response.username}`);
      } catch (err) {
        setIsLoggedIn(false);
        setMessage('로그인이 필요합니다');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // 로그인 처리
  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await post('/auth/login', { username, password });
      setIsLoggedIn(true);
      setMessage('로그인 성공! 액세스 토큰 만료 테스트를 시작합니다.');
    } catch (err) {
      setError('로그인 실패: 사용자 이름 또는 비밀번호가 잘못되었습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      setLoading(true);
      await post('/auth/logout');
      setIsLoggedIn(false);
      setMessage('로그아웃 성공');
      router.replace('/login');
    } catch (err) {
      setError('로그아웃 실패');
    } finally {
      setLoading(false);
    }
  };

  // 보호된 리소스 요청 테스트
  const testProtectedResource = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await get<{ message: string }>('/posts', {
        revalidate: 0, // 캐싱 없이 매번 새로 요청
      });
      setRequestCount((prev) => prev + 1);
      setMessage(`요청 ${requestCount + 1} 성공: ${JSON.stringify(response)}`);
    } catch (err) {
      setError(
        `요청 실패: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setLoading(false);
    }
  };

  // 주기적으로 보호된 리소스 요청 (액세스 토큰 만료 테스트)
  const startContinuousRequests = () => {
    // 이전 인터벌 제거
    if (window.testInterval) {
      clearInterval(window.testInterval);
    }

    setMessage('15초 간격으로 요청 테스트를 시작합니다...');

    // 15초마다 요청 보내기 (액세스 토큰 만료 확인을 위해)
    const intervalId = setInterval(async () => {
      await testProtectedResource();
    }, 15000);

    // 글로벌 변수에 인터벌 ID 저장
    window.testInterval = intervalId;
  };

  // 테스트 중지
  const stopContinuousRequests = () => {
    if (window.testInterval) {
      clearInterval(window.testInterval);
      window.testInterval = undefined;
      setMessage('요청 테스트가 중지되었습니다.');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">인증 리프레시 테스트</h1>
      <p className="mb-4 text-sm text-gray-600">
        액세스 토큰은 10초 후 만료되며, 자동으로 리프레시됩니다. 로그인 후 15초
        간격으로 요청을 보내 리프레시 동작을 테스트합니다.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {loading && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
          요청 처리 중...
        </div>
      )}

      <div className="mb-4 p-3 bg-gray-100 rounded">
        <strong>상태:</strong> {message}
      </div>

      {!isLoggedIn ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              사용자 이름
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="john 또는 maria"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password123 또는 password456"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={loading || !username || !password}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            로그인
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={testProtectedResource}
              disabled={loading}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:bg-green-300"
            >
              요청 테스트
            </button>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:bg-red-300"
            >
              로그아웃
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={startContinuousRequests}
              disabled={loading}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              자동 테스트 시작
            </button>
            <button
              onClick={stopContinuousRequests}
              disabled={loading}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 disabled:bg-gray-300"
            >
              테스트 중지
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 타입스크립트를 위한 Window 인터페이스 확장
declare global {
  interface Window {
    testInterval?: NodeJS.Timeout;
  }
}
