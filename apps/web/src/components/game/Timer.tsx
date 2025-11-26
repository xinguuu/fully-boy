import { useEffect, useState } from 'react';

interface TimerProps {
  duration: number;
  onTimeUp?: () => void;
  autoStart?: boolean;
  startedAt?: Date | string;
  /** Preview mode: static display, no countdown */
  isPreview?: boolean;
  /** Static percentage for preview mode (0-100) */
  previewPercentage?: number;
}

export function Timer({ duration, onTimeUp, autoStart = true, startedAt, isPreview = false, previewPercentage = 75 }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart && !isPreview);

  // In preview mode, show static time based on percentage
  const displayTime = isPreview ? Math.round(duration * (previewPercentage / 100)) : timeLeft;
  const percentage = isPreview ? previewPercentage : (timeLeft / duration) * 100;
  const isWarning = percentage <= 30;
  const isDanger = percentage <= 10;

  useEffect(() => {
    // Skip timer logic in preview mode
    if (isPreview) return;

    if (startedAt) {
      // Server-based timer: calculate remaining time based on server start time
      const startTime = new Date(startedAt).getTime();
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, duration - elapsedSeconds);

      setTimeLeft(remaining);
      setIsRunning(remaining > 0 && autoStart);
    } else {
      // Client-based timer (fallback)
      setTimeLeft(duration);
      setIsRunning(autoStart);
    }
  }, [duration, autoStart, startedAt, isPreview]);

  useEffect(() => {
    // Skip interval in preview mode
    if (isPreview) return;

    if (!isRunning || timeLeft <= 0) {
      if (timeLeft === 0 && onTimeUp) {
        onTimeUp();
      }
      return;
    }

    const interval = setInterval(() => {
      if (startedAt) {
        // Recalculate from server time to stay in sync
        const startTime = new Date(startedAt).getTime();
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const remaining = Math.max(0, duration - elapsedSeconds);

        setTimeLeft(remaining);

        if (remaining <= 0) {
          setIsRunning(false);
        }
      } else {
        // Client-based countdown (fallback)
        setTimeLeft((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            setIsRunning(false);
            return 0;
          }
          return next;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onTimeUp, startedAt, duration, isPreview]);

  const getColor = () => {
    if (isDanger) return 'text-error';
    if (isWarning) return 'text-warning';
    return 'text-primary-500';
  };

  const getBgColor = () => {
    if (isDanger) return 'bg-error';
    if (isWarning) return 'bg-warning';
    return 'bg-primary-500';
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`text-5xl font-bold transition-colors duration-300 ${getColor()}`}>
        {displayTime}초
      </div>

      <div className="w-full max-w-md h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${getBgColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isDanger && (
        <p className="text-sm font-medium text-error animate-pulse">시간이 얼마 남지 않았습니다!</p>
      )}
    </div>
  );
}
