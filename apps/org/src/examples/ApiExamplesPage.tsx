'use client';

import React, { Suspense } from 'react';
import { ReactQueryProvider } from '../lib/api/ReactQueryProvider';
import UniversalApiExample from './UniversalApiExample';
// 서버 컴포넌트는 직접 임포트하지 않습니다
// import UniversalApiServerExample from './UniversalApiServerExample';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// 태그 예시 컴포넌트는 클라이언트 컴포넌트이므로 동적으로 임포트
const TagExampleClient = dynamic(() => import('./TagExampleClient'), {
  ssr: false,
  loading: () => (
    <div className="p-6 border rounded-lg">태그 예시 컴포넌트 로딩 중...</div>
  ),
});

// Posts 컴포넌트는 클라이언트 컴포넌트이므로 동적으로 임포트
const PostsExample = dynamic(() => import('./PostsExample'), {
  ssr: false,
  loading: () => (
    <div className="p-6 border rounded-lg">Posts 예시 컴포넌트 로딩 중...</div>
  ),
});

// 인증 테스트 컴포넌트는 클라이언트 컴포넌트이므로 동적으로 임포트
const AuthTestExample = dynamic(() => import('./AuthTestExample'), {
  ssr: false,
  loading: () => (
    <div className="p-6 border rounded-lg">인증 테스트 컴포넌트 로딩 중...</div>
  ),
});

/**
 * 통합 API 예제 모음 페이지
 */
export default function ApiExamplesPage() {
  return (
    <ReactQueryProvider>
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">통합 API 예시</h1>
        <p className="mb-8 text-lg">
          Next.js 15를 위한 통합 API 시스템은 서버와 클라이언트 컴포넌트
          모두에서 일관된 방식으로 API를 호출할 수 있게 해줍니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* 클라이언트 컴포넌트 섹션 */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              클라이언트 컴포넌트 예시
            </h2>
            <p className="mb-4">
              클라이언트 컴포넌트에서는 React Query와 통합된 API를 활용하여 서버
              상태를 효율적으로 관리합니다.
            </p>
            <div className="border rounded-lg overflow-hidden">
              <Suspense fallback={<div className="p-6">로딩 중...</div>}>
                <UniversalApiExample />
              </Suspense>
            </div>
          </div>

          {/* 서버 컴포넌트 섹션 */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">서버 컴포넌트 예시</h2>
            <p className="mb-4">
              서버 컴포넌트에서는 동일한 API를 사용하여 서버에서 직접 데이터를
              가져오고 렌더링합니다.
            </p>
            <div className="border rounded-lg p-6 overflow-hidden">
              <p className="mb-4">
                서버 컴포넌트 예시는 다음 링크에서 확인할 수 있습니다:
              </p>
              <Link
                href="/examples/api/server"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                서버 컴포넌트 예시 보기
              </Link>
            </div>
          </div>
        </div>

        {/* Nest.js 백엔드 API 예시 섹션 */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            Nest.js 백엔드 API 예시
          </h2>
          <p className="mb-4">
            Nest.js로 구현된 백엔드 API를 호출하고 통합 API 시스템을 활용하여
            데이터를 효율적으로 관리하는 방법을 보여줍니다.
          </p>
          <div className="border rounded-lg overflow-hidden">
            <Suspense
              fallback={<div className="p-6">Posts 예시 로딩 중...</div>}
            >
              <PostsExample />
            </Suspense>
          </div>
        </div>

        {/* 인증 및 토큰 리프레시 테스트 섹션 */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            인증 및 토큰 리프레시 테스트
          </h2>
          <p className="mb-4">
            짧은 만료 시간(10초)의 액세스 토큰과 자동 리프레시 메커니즘을
            테스트합니다. 이 예제를 통해 인증 상태를 유지하면서 API 요청이 중단
            없이 진행되는 것을 확인할 수 있습니다.
          </p>
          <div className="border rounded-lg overflow-hidden">
            <Suspense
              fallback={<div className="p-6">인증 테스트 로딩 중...</div>}
            >
              <AuthTestExample />
            </Suspense>
          </div>
        </div>

        {/* 태그 기반 캐싱 예시 섹션 */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            태그 기반 캐싱 및 재검증 예시
          </h2>
          <p className="mb-4">
            Next.js 15의 태그 기반 캐싱 시스템을 활용하여 연관된 데이터를
            그룹화하고 효율적으로 재검증하는 방법을 보여줍니다.
          </p>
          <div className="border rounded-lg overflow-hidden">
            <Suspense
              fallback={<div className="p-6">태그 예시 로딩 중...</div>}
            >
              <TagExampleClient />
            </Suspense>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg mb-12">
          <h2 className="text-2xl font-semibold mb-4">통합 API 구조</h2>
          <p className="mb-4">
            아래는 통합 API의 핵심 컴포넌트와 사용 방법입니다:
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium mb-2">
                서버 컴포넌트에서 사용하기
              </h3>
              <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto">
                {`// 데이터 가져오기
const data = await get('/endpoint', {
  revalidate: 60, // 60초 캐싱
  tags: ['tag-name'], // 캐시 태그 설정
});

// 데이터 생성하기
const result = await post('/endpoint', data);`}
              </pre>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2">
                클라이언트 컴포넌트에서 사용하기
              </h3>
              <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto">
                {`// React Query와 함께 사용
const { data } = useQuery({
  queryKey: ['key'],
  queryFn: () => get('/endpoint', {
    revalidate: 60,
    tags: ['tag-name'],
  })
});

// 데이터 변경하기
const mutation = useMutation({
  mutationFn: (data) => post('/endpoint', data)
});`}
              </pre>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2">태그 기반 재검증</h3>
              <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto">
                {`// 서버 액션에서 태그 기반 재검증 
'use server'
import { revalidateTag } from 'next/cache';

export async function refreshData() {
  // 특정 태그와 연결된 모든 데이터 재검증
  revalidateTag('tag-name');
  return { success: true };
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </ReactQueryProvider>
  );
}
