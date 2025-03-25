'use client';

import { useEffect, useState } from 'react';

interface CacheExpiryTimerProps {
  loadTimestamp: number;
  cacheDuration: number;
  autoRefresh?: boolean;
}

export default function CacheExpiryTimer({
  loadTimestamp,
  cacheDuration = 15,
  autoRefresh = true,
}: CacheExpiryTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(cacheDuration);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [willRefresh, setWillRefresh] = useState<boolean>(false);

  useEffect(() => {
    // 처음 로딩 시 경과 시간 계산
    const initialElapsed = Math.floor((Date.now() - loadTimestamp) / 1000);

    // 2초의 버퍼를 추가하여 실제 캐싱 시간과 더 일치하도록 함
    const initialRemaining = Math.max(0, cacheDuration - initialElapsed - 2);

    // 이미 만료된 경우
    if (initialRemaining <= 0) {
      setTimeRemaining(0);
      setIsExpired(true);
      return;
    }

    setTimeRemaining(initialRemaining);

    // 1초마다 타이머 업데이트
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newValue = prev - 1;
        if (newValue <= 0) {
          clearInterval(interval);
          setIsExpired(true);

          // 만료 시 자동 새로고침 활성화 옵션이 있을 경우
          if (autoRefresh) {
            setWillRefresh(true);
            setTimeout(() => {
              window.location.reload();
            }, 2000); // 만료 2초 후 새로고침
          }

          return 0;
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loadTimestamp, cacheDuration, autoRefresh]);

  // 진행 상태 계산 (0-100%)
  const progressPercentage = Math.max(
    0,
    Math.min(100, (timeRemaining / cacheDuration) * 100)
  );

  // 시간 포맷팅 (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1 items-center">
        <span className="text-sm font-medium">
          {isExpired
            ? willRefresh
              ? '캐시 만료됨 - 페이지 새로고침 중...'
              : '캐시 만료됨 - 다음 요청 시 새로운 데이터 로드'
            : '캐시 상태: 유효'}
        </span>
        <span
          className={`text-sm font-medium ${
            isExpired
              ? willRefresh
                ? 'text-blue-600'
                : 'text-red-600'
              : timeRemaining < 10
              ? 'text-orange-600'
              : 'text-green-600'
          }`}
        >
          {isExpired
            ? willRefresh
              ? '곧 새로고침'
              : '만료됨'
            : formatTime(timeRemaining)}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${
            isExpired
              ? willRefresh
                ? 'bg-blue-600'
                : 'bg-red-600'
              : timeRemaining < 10
              ? 'bg-orange-500'
              : 'bg-green-600'
          }`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        {isExpired ? (
          willRefresh ? (
            <span className="text-blue-600 font-medium">
              곧 새로운 데이터를 가져옵니다...
            </span>
          ) : (
            <span>
              캐시가 만료되었습니다. 페이지를 새로고침하면 새로운 데이터가
              로드됩니다.
            </span>
          )
        ) : (
          <>
            <span>
              캐시 만료 후 {autoRefresh ? '자동으로 ' : ''}새로운 데이터가
              로드됩니다.
            </span>
            {autoRefresh && (
              <>
                <br />
                <span className="text-blue-600">
                  자동 새로고침이 활성화되어 있습니다.
                </span>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
