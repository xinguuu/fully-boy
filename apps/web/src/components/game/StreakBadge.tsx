'use client';

import { useEffect } from 'react';
import { useSound } from '@/lib/hooks';
import { SOUND_TYPES } from '@/lib/constants/sounds';

interface StreakBadgeProps {
  streak: number;
  show: boolean;
}

export function StreakBadge({ streak, show }: StreakBadgeProps) {
  const { playSound } = useSound();

  useEffect(() => {
    if (!show || streak < 2) return;

    if (streak >= 5) {
      playSound(SOUND_TYPES.STREAK_5);
    } else if (streak >= 3) {
      playSound(SOUND_TYPES.STREAK_3);
    } else if (streak >= 2) {
      playSound(SOUND_TYPES.STREAK_2);
    }
  }, [streak, show, playSound]);

  if (!show || streak < 2) return null;

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

  const getStreakText = () => {
    if (streak >= 5) return '불꽃 스트릭!';
    if (streak >= 3) return '연속 정답!';
    return '연속 정답!';
  };

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-full
        bg-gradient-to-r ${getStreakColor()}
        text-white font-bold text-lg
        shadow-lg animate-scale-in
      `}
    >
      <span className="text-xl">{getStreakEmoji()}</span>
      <span>{streak}연속!</span>
      <span className="text-sm opacity-90">{getStreakText()}</span>
    </div>
  );
}
