import { useEffect, useState } from 'react';
import { useSound } from '@/lib/hooks';
import { SOUND_TYPES } from '@/lib/constants/sounds';

interface ScoreAnimationProps {
  isCorrect: boolean;
  points: number;
  message?: string;
  streak?: number;
}

export function ScoreAnimation({ isCorrect, points, message, streak = 0 }: ScoreAnimationProps) {
  const [show, setShow] = useState(false);
  const { playSound } = useSound();

  useEffect(() => {
    setShow(true);
    playSound(isCorrect ? SOUND_TYPES.ANSWER_CORRECT : SOUND_TYPES.ANSWER_WRONG);

    if (isCorrect && streak >= 2) {
      setTimeout(() => {
        if (streak >= 5) {
          playSound(SOUND_TYPES.STREAK_5);
        } else if (streak >= 3) {
          playSound(SOUND_TYPES.STREAK_3);
        } else {
          playSound(SOUND_TYPES.STREAK_2);
        }
      }, 500);
    }

    const timer = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(timer);
  }, [isCorrect, playSound, streak]);

  if (!show) return null;

  const getStreakColor = () => {
    if (streak >= 5) return 'from-primary-600 to-error';
    if (streak >= 3) return 'from-primary-500 to-secondary-500';
    return 'from-warning to-primary-500';
  };

  const getStreakEmoji = () => {
    if (streak >= 5) return '🔥🔥';
    if (streak >= 3) return '🔥';
    return '⚡';
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 animate-fade-in" />

      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div
          className={`
          text-center space-y-6 animate-scale-in
          ${isCorrect ? 'text-success' : 'text-error'}
        `}
        >
          <div
            className={`
            text-9xl font-black
            ${isCorrect ? 'animate-pop' : 'animate-shake'}
          `}
          >
            {isCorrect ? '✓' : '✗'}
          </div>

          <div className="text-6xl md:text-7xl font-black text-white drop-shadow-2xl">
            {isCorrect ? '정답입니다!' : '아쉬워요!'}
          </div>

          {isCorrect && (
            <div className="text-8xl md:text-9xl font-black text-white drop-shadow-2xl">
              +{points}점
            </div>
          )}

          {isCorrect && streak >= 2 && (
            <div
              className={`
                inline-flex items-center gap-3 px-6 py-3 rounded-full
                bg-gradient-to-r ${getStreakColor()}
                text-white font-black text-2xl md:text-3xl
                shadow-2xl animate-scale-in
              `}
            >
              <span className="text-3xl">{getStreakEmoji()}</span>
              <span>{streak}연속 정답!</span>
            </div>
          )}

          {message && (
            <div className="text-2xl md:text-3xl font-semibold text-white/90">{message}</div>
          )}
        </div>
      </div>
    </>
  );
}
