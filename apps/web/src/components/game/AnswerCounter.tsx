'use client';

import { useEffect, useState, useRef } from 'react';
import { useSound } from '@/lib/hooks';
import { SOUND_TYPES } from '@/lib/constants/sounds';

interface AnswerCounterProps {
  answered: number;
  total: number;
  showResults?: boolean;
}

export function AnswerCounter({ answered, total, showResults = false }: AnswerCounterProps) {
  const [displayedCount, setDisplayedCount] = useState(answered);
  const prevAnsweredRef = useRef(answered);
  const { playSound } = useSound();

  useEffect(() => {
    if (answered > prevAnsweredRef.current && !showResults) {
      playSound(SOUND_TYPES.ANSWER_SUBMIT);
    }
    prevAnsweredRef.current = answered;
    setDisplayedCount(answered);
  }, [answered, showResults, playSound]);

  const percentage = total > 0 ? (displayedCount / total) * 100 : 0;
  const allAnswered = displayedCount === total && total > 0;

  if (showResults) return null;

  return (
    <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-4 md:p-6 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 md:w-6 md:h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium">응답 현황</p>
            <p className="text-white text-2xl md:text-3xl font-black">
              {displayedCount}
              <span className="text-white/60 text-lg md:text-xl font-medium"> / {total}명</span>
            </p>
          </div>
        </div>

        {allAnswered && (
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full animate-pulse">
            <span className="text-white font-bold text-sm md:text-base">✅ 전원 응답 완료!</span>
          </div>
        )}
      </div>

      <div className="w-full bg-white/20 rounded-full h-3 md:h-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            allAnswered ? 'bg-accent-400' : 'bg-white'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between mt-2 text-white/80 text-sm font-medium">
        <span>{percentage.toFixed(0)}% 응답</span>
        <span>{total - displayedCount}명 대기 중</span>
      </div>
    </div>
  );
}
