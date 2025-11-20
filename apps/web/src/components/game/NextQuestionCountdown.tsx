'use client';

import { useEffect, useState } from 'react';

interface NextQuestionCountdownProps {
  /** Duration in seconds (default: 5) */
  duration?: number;
  /** Show the countdown */
  show: boolean;
  /** Variant: 'inline' for embedded display, 'overlay' for full-screen transition */
  variant?: 'inline' | 'overlay';
}

/**
 * Countdown component shown when transitioning to next question
 * Design: Subtle inline progress bar instead of intrusive popup
 */
export function NextQuestionCountdown({
  duration = 5,
  show,
  variant = 'inline',
}: NextQuestionCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!show) {
      setTimeLeft(duration);
      return;
    }

    // Reset countdown when show becomes true
    setTimeLeft(duration);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [show, duration]);

  if (!show || timeLeft <= 0) {
    return null;
  }

  const progressPercent = ((duration - timeLeft) / duration) * 100;

  if (variant === 'overlay') {
    // Full-screen transition overlay (optional, not used by default)
    return (
      <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center animate-fade-in">
        <div className="bg-white dark:bg-dark-2 rounded-3xl shadow-2xl p-12 max-w-md w-full mx-4 animate-scale-in">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              다음 문제 준비 중
            </h3>
            <div className="relative w-32 h-32 mx-auto mb-6">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressPercent / 100)}`}
                  className="text-primary-500 transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-bold text-primary-600">{timeLeft}</span>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">곧 시작됩니다...</p>
          </div>
        </div>
      </div>
    );
  }

  // Inline variant: Subtle progress bar (default)
  return (
    <div className="animate-slide-down">
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg p-4 mb-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-semibold text-lg">다음 문제로 이동</span>
          <span className="text-white text-2xl font-bold">{timeLeft}초</span>
        </div>
        <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
