export default function Index() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Next.js + Nest.js 예제</h1>
      <p className="mb-8 text-gray-600">
        통합 API 시스템, 인증 메커니즘 및 다양한 Next.js 기능을 보여주는 예제
        컬렉션입니다.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API 예제 카드 */}
        <div className="border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-3">API 예제</h2>
          <p className="mb-4 text-gray-600">
            클라이언트 컴포넌트에서 React Query를 활용한 API 호출, 데이터 관리,
            태그 기반 캐싱 등을 확인할 수 있습니다.
          </p>
          <a
            href="/examples/api"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            API 예제 보기
          </a>
        </div>

        {/* 서버 컴포넌트 예제 카드 */}
        <div className="border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-3">서버 컴포넌트 예제</h2>
          <p className="mb-4 text-gray-600">
            서버 컴포넌트에서 API 데이터를 가져와 렌더링하고, 클라이언트로
            완성된 HTML을 전송하는 예제입니다.
          </p>
          <a
            href="/examples/api/server"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            서버 컴포넌트 예제 보기
          </a>
        </div>

        {/* 인증 예제 카드 */}
        <div className="border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-3">인증 테스트</h2>
          <p className="mb-4 text-gray-600">
            짧은 만료 시간(10초)을 가진 액세스 토큰과 자동 리프레시 메커니즘을
            테스트해볼 수 있습니다.
          </p>
          <a
            href="/login"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            로그인 테스트
          </a>
        </div>

        {/* Nest.js 백엔드 카드 */}
        <div className="border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-3">Nest.js 백엔드</h2>
          <p className="mb-4 text-gray-600">
            RESTful API, 인증, 데이터 관리 등 Nest.js로 구현된 백엔드
            시스템입니다.
          </p>
          <a
            href="http://localhost:3333/api"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            API 서버 확인 (새 탭)
          </a>
        </div>
      </div>

      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">프로젝트 정보</h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>Next.js 15 앱 라우터와 서버/클라이언트 컴포넌트</li>
          <li>Nest.js 백엔드 API 및 인증 시스템</li>
          <li>JWT 기반 인증 및 리프레시 토큰 메커니즘</li>
          <li>React Query를 활용한 클라이언트 상태 관리</li>
          <li>태그 기반 캐싱 및 재검증</li>
        </ul>
      </div>

      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p>Next.js 15 + Nest.js 예제 프로젝트</p>
        <p className="mt-1">Nx 모노레포에서 구현된 풀스택 애플리케이션</p>
      </footer>
    </div>
  );
}
