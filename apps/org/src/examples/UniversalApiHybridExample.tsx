import { get } from '../lib/api';
import { HybridTodoList } from './components/HybridTodoList';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}

/**
 * 서버 컴포넌트와 클라이언트 컴포넌트를 결합한 하이브리드 예제
 * 서버에서 초기 데이터를 가져오고, 클라이언트에서 React Query로 관리합니다.
 */
export async function UniversalApiHybridExample() {
  // 서버에서 초기 데이터 가져오기
  let initialTodos: Todo[] = [];
  try {
    initialTodos = await get<Todo[]>('/todos', {
      revalidate: 30,
      tags: ['todos'],
      params: { _limit: 5 },
      cache: 'force-cache',
    });
  } catch (error) {
    console.error('서버에서 초기 데이터 로딩 실패:', error);
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg mb-4 text-sm">
        <p>이 컴포넌트는 서버와 클라이언트 렌더링을 결합했습니다:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>서버에서 초기 데이터를 가져옵니다 (SSR)</li>
          <li>클라이언트에서 React Query로 데이터를 관리합니다</li>
          <li>실시간 업데이트와 캐시 관리가 가능합니다</li>
        </ul>
      </div>

      <h1 className="text-2xl font-bold mb-4">하이브리드 API 예제</h1>

      {/* 클라이언트 컴포넌트에 초기 데이터 전달 */}
      <HybridTodoList initialTodos={initialTodos} />

      <div className="mt-6 text-sm text-gray-600">
        <p>
          초기 데이터는 서버에서 가져오므로 첫 로딩이 빠르고, 이후
          클라이언트에서 React Query로 관리되어 실시간 업데이트가 가능합니다.
        </p>
      </div>
    </div>
  );
}
