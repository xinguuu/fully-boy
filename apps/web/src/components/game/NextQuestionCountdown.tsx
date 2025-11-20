'use client';

import { useEffect, useState } from 'react';

interface NextQuestionCountdownProps {
  /** Duration in seconds (default: 5) */
  duration?: number;
  /** Show the countdown */
  show: boolean;
}

/**
 * Countdown component shown when all participants have answered
 * Displays "Next question in X..." message
 */
export function NextQuestionCountdown({ duration = 5, show }: NextQuestionCountdownProps) {
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

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
      <div className="bg-primary-600 text-white px-8 py-4 rounded-2xl shadow-2xl border-4 border-white">
        <div className="text-center">
          <p className="text-sm font-semibold mb-1 text-white/90">다음 문제로 이동</p>
          <div className="flex items-center gap-3">
            <div className="text-4xl font-black">{timeLeft}</div>
            <div className="text-lg font-medium">초 후</div>
          </div>
        </div>
      </div>
    </div>
  );
}
