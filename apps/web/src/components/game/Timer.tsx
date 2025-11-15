import { useEffect, useState } from 'react';

interface TimerProps {
  duration: number;
  onTimeUp?: () => void;
  autoStart?: boolean;
}

export function Timer({ duration, onTimeUp, autoStart = true }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);

  const percentage = (timeLeft / duration) * 100;
  const isWarning = percentage <= 30;
  const isDanger = percentage <= 10;

  useEffect(() => {
    setTimeLeft(duration);
    setIsRunning(autoStart);
  }, [duration, autoStart]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft === 0 && onTimeUp) {
        onTimeUp();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setIsRunning(false);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onTimeUp]);

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
        {timeLeft}초
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
