'use client';

import { useState } from 'react';
import { revalidateTagAction } from '../../app/actions';

interface TagRevalidateButtonProps {
  tags: string[];
  label: string;
  className?: string;
  autoRefresh?: boolean;
}

/**
 * 태그 재검증 버튼 컴포넌트
 * 서버 액션을 호출하여 지정된 태그로 데이터를 재검증하는 클라이언트 컴포넌트
 */
export default function TagRevalidateButton({
  tags,
  label,
  className = '',
  autoRefresh = false,
}: TagRevalidateButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastRevalidated, setLastRevalidated] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);

  async function handleClick() {
    setIsLoading(true);
    setSuccess(null);
    try {
      // 재검증 액션 호출
      const result = await revalidateTagAction(tags);
      setSuccess(result.success);

      // 현재 시간을 마지막 재검증 시간으로 설정
      setLastRevalidated(
        new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );

      // 자동 새로고침 옵션이 활성화된 경우
      if (autoRefresh && result.success) {
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      console.error('재검증 실패:', error);
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`${className} ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? '재검증 중...' : label}
      </button>
      {lastRevalidated && (
        <div
          className={`text-xs mt-1 ${
            success
              ? 'text-green-600'
              : success === false
              ? 'text-red-600'
              : 'text-gray-500'
          }`}
        >
          {success
            ? `✓ ${lastRevalidated}에 재검증됨`
            : success === false
            ? `✗ 재검증 실패 (${lastRevalidated})`
            : `${lastRevalidated}에 재검증됨`}
        </div>
      )}
      {autoRefresh && success && (
        <div className="text-xs text-blue-500 mt-1">자동 새로고침 중...</div>
      )}
    </div>
  );
}
