import { TagExampleServer } from '@/examples/TagExampleServer';
import SimpleCacheExample from '@/examples/SimpleCacheExample';
import ServerFetchedData from '@/examples/ServerFetchedData';

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">대시보드</h1>

      <div className="mb-10">
        <SimpleCacheExample serverComponent={<ServerFetchedData />} />
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">서버 컴포넌트 예제</h2>
        <TagExampleServer />
      </div>
    </div>
  );
}
