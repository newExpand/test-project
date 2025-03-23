'use client';

import { useState } from 'react';
import { useApiQuery, useApiMutation } from '../../lib/api';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}

interface HybridTodoListProps {
  initialTodos: Todo[];
}

export function HybridTodoList({ initialTodos }: HybridTodoListProps) {
  const [newTodoTitle, setNewTodoTitle] = useState('');

  // React Query로 데이터 관리 (서버에서 받은 initialData 사용)
  const {
    data: todos,
    isLoading,
    refetch,
  } = useApiQuery<Todo[]>(
    ['todos'],
    '/todos',
    {
      params: { _limit: 5 },
      revalidate: 60,
    },
    {
      initialData: initialTodos, // 서버에서 받은 초기 데이터
      refetchOnMount: false, // 마운트 시 즉시 재요청하지 않음
    }
  );

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
  const handleAddTodo = () => {
    if (!newTodoTitle.trim()) return;

    addTodoMutation.mutate({
      title: newTodoTitle,
      completed: false,
      userId: 1,
    });
  };

  // 할일 토글 뮤테이션
  const toggleTodoMutation = useApiMutation<
    Todo,
    { id: number; completed: boolean }
  >('/todos', {
    onSuccess: () => {
      refetch();
    },
  });

  // 할일 완료 상태 토글 핸들러
  const handleToggleTodo = (todo: Todo) => {
    toggleTodoMutation.mutate({
      id: todo.id,
      completed: !todo.completed,
    });
  };

  return (
    <div>
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

      <div>
        <h2 className="text-xl font-semibold mb-2">할일 목록</h2>
        {isLoading ? (
          <p className="text-gray-500">로딩 중...</p>
        ) : todos && todos.length > 0 ? (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                onClick={() => handleToggleTodo(todo)}
                className={`p-3 border rounded cursor-pointer hover:bg-gray-50 transition-colors
                  ${todo.completed ? 'bg-gray-100' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={
                      todo.completed ? 'line-through text-gray-500' : ''
                    }
                  >
                    {todo.title}
                  </span>
                  <span
                    className={`text-sm ${
                      todo.completed ? 'text-green-600' : 'text-yellow-600'
                    }`}
                  >
                    {todo.completed ? '완료' : '진행 중'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">할일이 없습니다.</p>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>* 할일을 클릭하면 완료 상태가 토글됩니다.</p>
        <p>
          * 초기 데이터는 서버에서 가져왔으며, 이후 업데이트는 클라이언트에서
          처리됩니다.
        </p>
      </div>
    </div>
  );
}
