'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { revalidateUserData } from '@/app/actions';

export default function RevalidateButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  }>({});

  const handleRevalidate = async () => {
    setIsLoading(true);
    setResult({});

    try {
      // 서버 액션 호출 (태그 기반 재검증)
      const response = await revalidateUserData();

      if (!response.success) {
        setResult({
          success: false,
          error: response.error || '재검증 중 오류가 발생했습니다.',
        });
      } else {
        setResult({
          success: true,
          message: response.message,
        });

        // 페이지 리프레시하여 업데이트된 데이터 표시
        router.refresh();
      }
    } catch (error) {
      setResult({
        success: false,
        error: '요청 처리 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleRevalidate}
        disabled={isLoading}
        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded disabled:opacity-50 w-fit"
      >
        {isLoading ? '처리 중...' : '데이터 재검증'}
      </button>

      {result.success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
          {result.message}
        </div>
      )}

      {result.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
          {result.error}
        </div>
      )}
    </div>
  );
}
