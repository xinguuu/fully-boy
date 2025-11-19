import { useEffect, useState } from 'react';

interface ScoreAnimationProps {
  isCorrect: boolean;
  points: number;
  message?: string;
}

export function ScoreAnimation({ isCorrect, points, message }: ScoreAnimationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 animate-fade-in" />

      {/* Score popup */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div
          className={`
          text-center space-y-6 animate-scale-bounce
          ${isCorrect ? 'text-success' : 'text-error'}
        `}
        >
          {/* Icon */}
          <div
            className={`
            text-9xl font-black
            ${isCorrect ? 'animate-bounce' : 'animate-shake'}
          `}
          >
            {isCorrect ? '✓' : '✗'}
          </div>

          {/* Result text */}
          <div className="text-6xl md:text-7xl font-black text-white drop-shadow-2xl">
            {isCorrect ? '정답입니다!' : '아쉬워요!'}
          </div>

          {/* Points */}
          {isCorrect && (
            <div className="text-8xl md:text-9xl font-black text-white drop-shadow-2xl animate-pulse">
              +{points}점
            </div>
          )}

          {/* Custom message */}
          {message && (
            <div className="text-2xl md:text-3xl font-semibold text-white/90">{message}</div>
          )}
        </div>
      </div>
    </>
  );
}
