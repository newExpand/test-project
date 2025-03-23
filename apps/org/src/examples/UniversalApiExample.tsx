'use client';

import { useState } from 'react';
import { useApiQuery, useApiMutation, get, post } from '../lib/api';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}

/**
 * 통합 API를 사용하는 예제 컴포넌트
 * 서버 컴포넌트와 클라이언트 컴포넌트에서 동일한 API 모듈을 사용합니다
 */
export default function UniversalApiExample() {
  const [newTodoTitle, setNewTodoTitle] = useState('');

  // React Query로 데이터 가져오기
  const {
    data: todos,
    isLoading,
    refetch,
  } = useApiQuery<Todo[]>(['todos'] as const, '/todos', {
    params: { _limit: 5 },
    revalidate: 60,
  });

  // 새 할일 추가 뮤테이션
  const addTodoMutation = useApiMutation<
    Todo,
    { title: string; completed: boolean; userId: number }
  >('/todos', {
    onSuccess: () => {
      refetch();
      setNewTodoTitle('');
    },
  });

  // 할일 추가 핸들러
  const handleAddTodo = async () => {
    if (!newTodoTitle.trim()) return;

    addTodoMutation.mutate({
      title: newTodoTitle,
      completed: false,
      userId: 1,
    });
  };

  // 직접 API 호출 예시
  const handleDirectApiCall = async () => {
    try {
      // 통합 API 함수 직접 호출
      const result = await get<Todo[]>('/todos', {
        params: { _limit: 3 },
        revalidate: 0, // 캐싱 없음
      });
      console.log('직접 API 호출 결과:', result);

      // 상태 갱신 없이 새 할일 추가
      const newTodo = await post<Todo>('/todos', {
        title: 'API 직접 호출로 추가된 할일',
        completed: false,
        userId: 1,
      });
      console.log('새 할일 추가됨:', newTodo);

      // 목록 다시 가져오기
      refetch();
    } catch (error) {
      console.error('API 호출 오류:', error);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">통합 API 예제</h1>

      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder="새 할일 입력"
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            onClick={handleAddTodo}
            disabled={addTodoMutation.isPending || !newTodoTitle.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {addTodoMutation.isPending ? '추가 중...' : '추가'}
          </button>
        </div>

        <button
          onClick={handleDirectApiCall}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 w-full"
        >
          API 직접 호출 테스트
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">할일 목록</h2>
        {isLoading ? (
          <p className="text-gray-500">로딩 중...</p>
        ) : todos && todos.length > 0 ? (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className={`p-2 border rounded ${
                  todo.completed ? 'bg-gray-100 line-through' : ''
                }`}
              >
                {todo.title}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">할일이 없습니다.</p>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p>
          이 컴포넌트는 통합 API를 사용합니다. 동일한 API 함수가 서버와
          클라이언트 컴포넌트 모두에서 사용 가능합니다.
        </p>
      </div>
    </div>
  );
}
