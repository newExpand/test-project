import { Suspense } from 'react';
import Link from 'next/link';
import { TagExampleServer } from '../../../../examples/TagExampleServer';

/**
 * 서버 컴포넌트에서 태그 기반 캐싱 예제 페이지
 */
export default function ServerTagExamplePage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-6">
        <Link
          href="/examples/api"
          className="text-blue-600 hover:text-blue-800"
        >
          ← API 예제 목록으로 돌아가기
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-6">
        태그 기반 캐싱 (서버 컴포넌트)
      </h1>
      <p className="mb-8 text-lg">
        이 페이지는 Next.js 15의 서버 컴포넌트에서 태그 기반 캐싱 및 재검증
        기능을 보여줍니다. 서버 액션을 통해 특정 태그를 재검증하고, 새로운
        데이터를 표시하는 방법을 확인할 수 있습니다.
      </p>

      <Suspense
        fallback={
          <div className="border rounded-lg p-8 text-center">
            서버 컴포넌트 로딩 중...
          </div>
        }
      >
        <TagExampleServer />
      </Suspense>

      <div className="mt-10 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">
          Next.js 15 태그 기반 캐싱
        </h2>
        <p className="mb-4">
          Next.js 15의 태그 기반 캐싱은 다음과 같은 장점을 제공합니다:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>선택적 재검증</strong> - 전체 사이트를 다시 빌드하지 않고
            특정 데이터만 재검증할 수 있습니다.
          </li>
          <li>
            <strong>관련 데이터 그룹화</strong> - 동일한 태그로 여러 API 요청을
            그룹화하여 한 번에 재검증할 수 있습니다.
          </li>
          <li>
            <strong>효율적인 캐시 관리</strong> - 필요한 캐시만 갱신하여 서버
            부하를 줄일 수 있습니다.
          </li>
          <li>
            <strong>즉각적인 업데이트</strong> - 사용자가 항상 최신 데이터를 볼
            수 있도록 보장합니다.
          </li>
        </ul>
      </div>
    </div>
  );
}
