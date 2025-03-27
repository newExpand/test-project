import Link from 'next/link';

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Next.js 캐싱 테스트
        </h1>

        <p className="mb-8 text-gray-600">
          이 프로젝트는 Next.js의 다양한 데이터 캐싱 방식을 테스트하기 위한
          예제입니다. NestJS 백엔드 API에서는 사용자 데이터를 랜덤한 순서로
          반환하여 캐싱 여부를 쉽게 확인할 수 있습니다.
        </p>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">테스트 페이지</h2>
          <div className="grid gap-4">
            <Link
              href="/users"
              className="block bg-blue-50 hover:bg-blue-100 p-4 rounded-lg border border-blue-200 transition-colors"
            >
              <h3 className="font-semibold text-blue-700">기본 캐싱 (ISR)</h3>
              <p className="text-sm text-gray-600">
                30초마다 자동으로 데이터를 재검증하는 페이지입니다.
              </p>
            </Link>

            <Link
              href="/users/no-cache"
              className="block bg-yellow-50 hover:bg-yellow-100 p-4 rounded-lg border border-yellow-200 transition-colors"
            >
              <h3 className="font-semibold text-yellow-700">캐싱 없음</h3>
              <p className="text-sm text-gray-600">
                매 요청마다 새로운 데이터를 가져오는 페이지입니다.
              </p>
            </Link>

            <Link
              href="/users/revalidate"
              className="block bg-green-50 hover:bg-green-100 p-4 rounded-lg border border-green-200 transition-colors"
            >
              <h3 className="font-semibold text-green-700">수동 재검증</h3>
              <p className="text-sm text-gray-600">
                버튼을 클릭하여 데이터를 수동으로 재검증할 수 있는 페이지입니다.
              </p>
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-sm text-gray-500">
          <p>
            NestJS 백엔드와 Next.js 프론트엔드를 연결하여 다양한 캐싱 방식을
            테스트할 수 있습니다.
          </p>
          <p>
            사용자 목록의 순서가 변경되면 새로운 데이터가 로드된 것이고, 순서가
            동일하면 캐시된 데이터입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
