'use client';

import { useEffect, useState } from 'react';
import { useSound } from '@/lib/hooks';
import { SOUND_TYPES } from '@/lib/constants/sounds';

interface PodiumEntry {
  rank: number;
  nickname: string;
  score: number;
}

interface PodiumProps {
  entries: PodiumEntry[];
  onFirstPlaceReveal?: () => void;
}

export function Podium({ entries, onFirstPlaceReveal }: PodiumProps) {
  const [revealedCount, setRevealedCount] = useState(0);
  const { playSound } = useSound();

  const top3 = entries.slice(0, 3);
  const second = top3.find((e) => e.rank === 2);
  const first = top3.find((e) => e.rank === 1);
  const third = top3.find((e) => e.rank === 3);

  useEffect(() => {
    if (revealedCount >= 3) return;

    const timer = setTimeout(() => {
      setRevealedCount((prev) => {
        const next = prev + 1;
        if (next === 3) {
          playSound(SOUND_TYPES.VICTORY);
          onFirstPlaceReveal?.();
        } else {
          playSound(SOUND_TYPES.PODIUM_REVEAL);
        }
        return next;
      });
    }, revealedCount === 0 ? 500 : 1000);

    return () => clearTimeout(timer);
  }, [revealedCount, playSound, onFirstPlaceReveal]);

  const getPodiumHeight = (rank: number) => {
    switch (rank) {
      case 1:
        return 'h-36 md:h-44';
      case 2:
        return 'h-28 md:h-36';
      case 3:
        return 'h-20 md:h-28';
      default:
        return 'h-20';
    }
  };

  const getPodiumGradient = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-300 via-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-200 via-gray-300 to-gray-500';
      case 3:
        return 'from-orange-300 via-orange-400 to-orange-600';
      default:
        return 'from-gray-200 to-gray-400';
    }
  };

  const getGlowColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'shadow-[0_0_40px_rgba(234,179,8,0.6)]';
      case 2:
        return 'shadow-[0_0_30px_rgba(156,163,175,0.5)]';
      case 3:
        return 'shadow-[0_0_30px_rgba(251,146,60,0.5)]';
      default:
        return '';
    }
  };

  const getMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '';
    }
  };

  const isRevealed = (rank: number) => {
    if (rank === 3) return revealedCount >= 1;
    if (rank === 2) return revealedCount >= 2;
    if (rank === 1) return revealedCount >= 3;
    return false;
  };

  const renderPodiumSpot = (entry: PodiumEntry | undefined) => {
    if (!entry) return <div className="w-28 md:w-36" />;

    const revealed = isRevealed(entry.rank);
    const glowClass = revealed ? getGlowColor(entry.rank) : '';

    return (
      <div
        className={`flex flex-col items-center transition-all duration-700 ${
          revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Medal */}
        <div
          className={`mb-2 text-6xl md:text-7xl transition-transform duration-500 ${
            revealed && entry.rank === 1 ? 'animate-pop' : ''
          }`}
        >
          {getMedal(entry.rank)}
        </div>

        {/* Avatar with glow */}
        <div
          className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-white to-gray-100 flex items-center justify-center mb-3 transition-all duration-500 ${
            revealed ? `scale-100 ${glowClass}` : 'scale-0'
          }`}
        >
          <span className="text-3xl md:text-4xl font-black bg-gradient-to-br from-primary-500 to-secondary-500 bg-clip-text text-transparent">
            {entry.nickname.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Name and Score */}
        <div
          className={`text-center mb-3 transition-opacity duration-500 ${
            revealed ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="text-lg md:text-xl font-bold text-white truncate max-w-[100px] md:max-w-[140px] drop-shadow-lg"
            title={entry.nickname}
          >
            {entry.nickname}
          </div>
          <div className="text-2xl md:text-3xl font-black text-white drop-shadow-lg">
            {entry.score}
            <span className="text-lg">점</span>
          </div>
        </div>

        {/* Podium stand */}
        <div
          className={`w-28 md:w-36 ${getPodiumHeight(entry.rank)} bg-gradient-to-b ${getPodiumGradient(
            entry.rank
          )} rounded-t-xl flex items-center justify-center transition-all duration-700 ${
            revealed ? `scale-100 ${glowClass}` : 'scale-y-0'
          }`}
          style={{ transformOrigin: 'bottom' }}
        >
          <span className="text-4xl md:text-5xl font-black text-white/90 drop-shadow-lg">
            {entry.rank}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-end justify-center gap-3 md:gap-6 py-8">
      {renderPodiumSpot(second)}
      {renderPodiumSpot(first)}
      {renderPodiumSpot(third)}
    </div>
  );
}
