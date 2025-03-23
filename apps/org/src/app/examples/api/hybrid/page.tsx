import { Suspense } from 'react';
import { UniversalApiHybridExample } from '../../../../examples/UniversalApiHybridExample';

export default function HybridExamplePage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">하이브리드 API 예제 페이지</h1>
      <p className="mb-8 text-lg">
        서버 컴포넌트에서 초기 데이터를 가져오고, 클라이언트에서 React Query로
        관리하는 하이브리드 방식의 예제입니다.
      </p>

      <div className="mb-8">
        {/* <Suspense
          fallback={<div className="p-6 border rounded-lg">로딩 중...</div>}
        > */}
        <UniversalApiHybridExample />
        {/* </Suspense> */}
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">하이브리드 방식의 장점</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>서버 사이드 렌더링으로 초기 로딩 성능 향상</li>
          <li>SEO 최적화 가능</li>
          <li>React Query를 통한 효율적인 클라이언트 상태 관리</li>
          <li>실시간 업데이트와 낙관적 UI 구현 가능</li>
          <li>서버와 클라이언트의 장점을 모두 활용</li>
        </ul>
      </div>
    </div>
  );
}
