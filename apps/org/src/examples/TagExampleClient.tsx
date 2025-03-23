'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { get } from '../lib/api';
import {
  refreshUsers,
  refreshPosts,
  refreshMultipleTags,
} from '../app/actions';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}

/**
 * 태그 기반 캐싱과 재검증을 보여주는 클라이언트 컴포넌트
 */
export default function TagExampleClient() {
  const [refreshStatus, setRefreshStatus] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | null;
  }>({ message: '', type: null });

  // 'todos' 태그를 사용하여 할 일 데이터 가져오기
  const { data: todos, refetch: refetchTodos } = useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: async () =>
      get<Todo[]>('/todos', {
        revalidate: 60, // 60초 캐싱
        tags: ['todos'], // 'todos' 태그 지정
        params: { _limit: 5 }, // 5개만 가져오기
      }),
  });

  // 'users' 태그의 데이터 재검증
  const handleRefreshUsers = async () => {
    setRefreshStatus({ message: '사용자 데이터 재검증 중...', type: 'info' });
    try {
      const result = await refreshUsers();
      setRefreshStatus({
        message: result.message,
        type: result.success ? 'success' : 'error',
      });
    } catch (_error) {
      setRefreshStatus({
        message: '사용자 데이터 재검증 중 오류가 발생했습니다.',
        type: 'error',
      });
    }
  };

  // 'posts' 태그의 데이터 재검증
  const handleRefreshPosts = async () => {
    setRefreshStatus({ message: '게시물 데이터 재검증 중...', type: 'info' });
    try {
      const result = await refreshPosts();
      setRefreshStatus({
        message: result.message,
        type: result.success ? 'success' : 'error',
      });
    } catch (_error) {
      setRefreshStatus({
        message: '게시물 데이터 재검증 중 오류가 발생했습니다.',
        type: 'error',
      });
    }
  };

  // 'todos' 태그의 데이터 재검증 후 React Query로 다시 가져오기
  const handleRefreshTodos = async () => {
    setRefreshStatus({ message: '할 일 데이터 재검증 중...', type: 'info' });
    try {
      const result = await refreshMultipleTags(['todos']);
      setRefreshStatus({
        message: result.success
          ? '할 일 데이터 재검증이 완료되었습니다. 데이터를 다시 가져옵니다...'
          : '할 일 데이터 재검증에 실패했습니다.',
        type: result.success ? 'success' : 'error',
      });

      if (result.success) {
        // 서버 캐시가 재검증된 후 React Query로 데이터 다시 가져오기
        await refetchTodos();
        setRefreshStatus({
          message: '할 일 데이터가 성공적으로 새로고침되었습니다.',
          type: 'success',
        });
      }
    } catch (_error) {
      setRefreshStatus({
        message: '할 일 데이터 재검증 중 오류가 발생했습니다.',
        type: 'error',
      });
    }
  };

  // 모든 태그 재검증
  const handleRefreshAll = async () => {
    setRefreshStatus({ message: '모든 데이터 재검증 중...', type: 'info' });
    try {
      const result = await refreshMultipleTags(['users', 'posts', 'todos']);
      setRefreshStatus({
        message: result.message,
        type: result.success ? 'success' : 'error',
      });

      if (result.success) {
        // 할 일 데이터만 클라이언트에서 다시 가져오기
        await refetchTodos();
      }
    } catch (_error) {
      setRefreshStatus({
        message: '데이터 재검증 중 오류가 발생했습니다.',
        type: 'error',
      });
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
      <div className="bg-yellow-50 p-3 rounded-lg mb-4 text-sm">
        <p>이 컴포넌트는 클라이언트 컴포넌트로 렌더링되었습니다.</p>
        <p>태그 기반 캐싱과 재검증 예시를 보여줍니다.</p>
      </div>

      <h1 className="text-2xl font-bold mb-4">태그 기반 캐싱 예시</h1>

      {/* 알림 메시지 */}
      {refreshStatus.type && (
        <div
          className={`p-3 rounded-lg mb-4 ${
            refreshStatus.type === 'success'
              ? 'bg-green-100 text-green-800'
              : refreshStatus.type === 'error'
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {refreshStatus.message}
        </div>
      )}

      {/* 할 일 목록 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          할 일 목록{' '}
          <span className="text-sm font-normal">
            (60초 캐싱, &apos;todos&apos; 태그)
          </span>
        </h2>
        {todos ? (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="p-3 border rounded flex items-center"
              >
                <span
                  className={`mr-2 ${
                    todo.completed ? 'line-through text-gray-500' : ''
                  }`}
                >
                  {todo.title}
                </span>
                {todo.completed && (
                  <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    완료
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">로딩 중...</p>
        )}
      </div>

      {/* 재검증 버튼 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">재검증 작업</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRefreshUsers}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            사용자 재검증
          </button>
          <button
            onClick={handleRefreshPosts}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            게시물 재검증
          </button>
          <button
            onClick={handleRefreshTodos}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            할 일 재검증
          </button>
          <button
            onClick={handleRefreshAll}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
          >
            모든 데이터 재검증
          </button>
        </div>
      </div>

      {/* 설명 */}
      <div className="mt-6 bg-blue-50 p-3 rounded-lg text-sm">
        <h3 className="font-bold mb-2">태그 기반 캐싱 작동 방식:</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>태그 지정:</strong> API 요청에 태그를 지정합니다 (예:{' '}
            <code className="bg-gray-200 px-1 rounded">
              tags: [&apos;todos&apos;]
            </code>
            ).
          </li>
          <li>
            <strong>데이터 캐싱:</strong> Next.js는 해당 태그로 데이터를
            캐시합니다.
          </li>
          <li>
            <strong>재검증:</strong> 서버 액션을 통해{' '}
            <code className="bg-gray-200 px-1 rounded">
              revalidateTag(&apos;todos&apos;)
            </code>
            를 호출하여 태그에 연결된 모든 캐시 데이터를 한 번에 재검증합니다.
          </li>
          <li>
            <strong>데이터 갱신:</strong> 다음 요청 시 새로운 데이터가
            제공됩니다.
          </li>
        </ol>
      </div>
    </div>
  );
}
