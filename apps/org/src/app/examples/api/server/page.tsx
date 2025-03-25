import { Suspense } from 'react';
import UniversalApiServerExample from '../../../../examples/UniversalApiServerExample';
import Link from 'next/link';
import { get } from '@/lib/api';
import axios from 'axios';

/**
 * 서버 컴포넌트 API 예제 페이지
 * 서버 컴포넌트에서 API를 사용하는 예제를 보여줍니다.
 */
export default async function ServerApiExamplesPage() {
  const post = await axios.get('http://localhost:3333/api/posts', {
    adapter: 'fetch',
    fetchOptions: {
      cache: 'force-cache',
      next: { revalidate: 10 },
    },
  });

  console.log(post);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">서버 컴포넌트 API 예시</h1>
      <p className="mb-8 text-lg">
        서버 컴포넌트에서 통합 API 시스템을 사용하는 방법을 보여줍니다. 서버에서
        직접 데이터를 가져와 렌더링합니다.
      </p>

      <div className="mb-4">
        <Link
          href="/examples/api"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          API 예제 목록으로 돌아가기
        </Link>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Suspense
          fallback={<div className="p-6">서버 컴포넌트 로딩 중...</div>}
        >
          {/* <UniversalApiServerExample /> */}
        </Suspense>
      </div>

      <div className="mt-12 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">서버 컴포넌트의 장점</h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>
            데이터 가져오기와 렌더링이 서버에서 수행되어 클라이언트로 완성된
            HTML만 전송됩니다.
          </li>
          <li>
            클라이언트에 전송되는 JavaScript 번들 크기가 줄어들어 성능이
            향상됩니다.
          </li>
          <li>
            API 키나 토큰과 같은 민감한 정보를 클라이언트에 노출하지 않고도 API
            요청을 수행할 수 있습니다.
          </li>
          <li>
            서버에서 직접 데이터베이스나 내부 서비스에 접근할 수 있어
            안전합니다.
          </li>
        </ul>
      </div>
    </div>
  );
}
