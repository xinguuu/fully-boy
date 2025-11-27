'use client';

import { useEffect, useState, useRef } from 'react';
import { useSound } from '@/lib/hooks';
import { SOUND_TYPES } from '@/lib/constants/sounds';

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

export function Timer({
  duration,
  onTimeUp,
  autoStart = true,
  startedAt,
  isPreview = false,
  previewPercentage = 75,
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart && !isPreview);
  const { playSound } = useSound();
  const lastTickRef = useRef<number | null>(null);
  const hasPlayedEndSoundRef = useRef(false);

  // In preview mode, show static time based on percentage
  const displayTime = isPreview ? Math.round(duration * (previewPercentage / 100)) : timeLeft;
  const percentage = isPreview ? previewPercentage : (timeLeft / duration) * 100;
  const isWarning = percentage <= 30;
  const isDanger = percentage <= 10;

  // SVG circle calculations
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Reset sound refs when duration/startedAt changes (new question)
  useEffect(() => {
    lastTickRef.current = null;
    hasPlayedEndSoundRef.current = false;
  }, [duration, startedAt]);

  // Play countdown tick sounds in the last 5 seconds
  useEffect(() => {
    if (isPreview || !isRunning) return;

    if (timeLeft <= 5 && timeLeft > 0 && timeLeft !== lastTickRef.current) {
      lastTickRef.current = timeLeft;
      playSound(SOUND_TYPES.COUNTDOWN_TICK);
    }

    if (timeLeft === 0 && !hasPlayedEndSoundRef.current) {
      hasPlayedEndSoundRef.current = true;
      playSound(SOUND_TYPES.COUNTDOWN_END);
    }
  }, [timeLeft, isRunning, isPreview, playSound]);

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
    if (isDanger) return { text: 'text-error', stroke: '#EF4444', glow: 'shadow-error/50' };
    if (isWarning) return { text: 'text-warning', stroke: '#F59E0B', glow: 'shadow-warning/50' };
    return { text: 'text-primary-500', stroke: '#FF6B35', glow: 'shadow-primary-500/30' };
  };

  const colors = getColor();

  return (
    <div className="flex flex-col items-center gap-4" role="timer" aria-label="남은 시간">
      {/* Circular Timer */}
      <div className={`relative ${isDanger ? 'animate-pulse' : ''}`}>
        <svg
          width={size}
          height={size}
          className={`transform -rotate-90 drop-shadow-lg ${isDanger ? 'drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]' : ''}`}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E5E5"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Time display in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`text-5xl md:text-6xl font-black transition-colors duration-300 ${colors.text}`}
            aria-live={isDanger ? 'assertive' : 'polite'}
            aria-atomic="true"
          >
            {displayTime}
          </div>
        </div>
      </div>

      {/* Progress bar (for accessibility and additional visual) */}
      <div
        className="w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={displayTime}
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-label={`남은 시간 ${displayTime}초 / ${duration}초`}
      >
        <div
          className="h-full transition-all duration-1000 ease-linear rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: colors.stroke,
          }}
        />
      </div>

      {isDanger && (
        <p className="text-sm font-bold text-error" role="alert">
          ⏰ 시간이 얼마 남지 않았습니다!
        </p>
      )}
    </div>
  );
}
