'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/lib/hooks';
import { SOUND_TYPES } from '@/lib/constants/sounds';
import type { LeaderboardEntry } from '@/lib/websocket/types';

interface LeaderboardScreenProps {
  leaderboard: LeaderboardEntry[];
  questionIndex: number;
  totalQuestions: number;
  isOrganizer: boolean;
  onNextQuestion?: () => void;
}

export function LeaderboardScreen({
  leaderboard,
  questionIndex,
  totalQuestions,
  isOrganizer,
  onNextQuestion,
}: LeaderboardScreenProps) {
  const { playSound } = useSound();
  const isLastQuestion = questionIndex + 1 >= totalQuestions;

  // Track previous ranks for animation
  const prevRanksRef = useRef<Map<string, number>>(new Map());

  // Calculate rank changes
  const getRankChange = (playerId: string, currentRank: number): number => {
    const previousRank = prevRanksRef.current.get(playerId);
    if (previousRank === undefined) return 0;
    return previousRank - currentRank; // Positive = moved up, Negative = moved down
  };

  // Update previous ranks after render
  useEffect(() => {
    const newRanks = new Map<string, number>();
    leaderboard.forEach((entry) => {
      newRanks.set(entry.playerId, entry.rank);
    });
    prevRanksRef.current = newRanks;
  }, [leaderboard]);

  useEffect(() => {
    playSound(SOUND_TYPES.LEADERBOARD_REVEAL);
  }, [playSound]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-secondary-500 to-primary-700 p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-white/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            🏆 순위표
          </h1>
          <p className="text-xl md:text-2xl text-white/90">
            {questionIndex + 1}번 문제 종료
          </p>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 mb-8 animate-scale-in">
          <div className="space-y-3" role="list" aria-label="순위표">
            <AnimatePresence mode="popLayout">
              {leaderboard.slice(0, 10).map((entry) => {
                const isPodium = entry.rank <= 3;
                const medalColors = {
                  1: 'from-yellow-400 to-yellow-600',
                  2: 'from-gray-300 to-gray-500',
                  3: 'from-orange-400 to-orange-600',
                };
                const rankChange = getRankChange(entry.playerId, entry.rank);

                return (
                  <motion.div
                    key={entry.playerId}
                    layout
                    layoutId={entry.playerId}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{
                      layout: { type: 'spring', stiffness: 350, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                    role="listitem"
                    aria-label={`${entry.rank}위 ${entry.nickname} ${entry.score}점`}
                    className={`flex items-center justify-between p-4 md:p-6 rounded-2xl transition-colors duration-300 hover:scale-[1.02] ${
                      isPodium
                        ? `bg-gradient-to-r ${medalColors[entry.rank as 1 | 2 | 3]} text-white shadow-xl`
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-4 md:gap-6">
                      {/* Rank */}
                      <div
                        className={`text-3xl md:text-4xl font-black min-w-[60px] text-center ${
                          isPodium ? 'text-white' : 'text-gray-400'
                        }`}
                        aria-hidden="true"
                      >
                        {entry.rank === 1 && '🥇'}
                        {entry.rank === 2 && '🥈'}
                        {entry.rank === 3 && '🥉'}
                        {entry.rank > 3 && `${entry.rank}`}
                      </div>

                      {/* Nickname + Rank Change */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div
                            className={`text-xl md:text-2xl font-bold truncate max-w-[120px] md:max-w-[200px] ${
                              isPodium ? 'text-white' : 'text-gray-900'
                            }`}
                            title={entry.nickname}
                          >
                            {entry.nickname}
                          </div>
                          {/* Rank Change Indicator */}
                          {rankChange !== 0 && (
                            <motion.span
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                                rankChange > 0
                                  ? 'bg-green-500 text-white'
                                  : 'bg-red-500 text-white'
                              }`}
                            >
                              {rankChange > 0 ? `↑${rankChange}` : `↓${Math.abs(rankChange)}`}
                            </motion.span>
                          )}
                        </div>
                        {entry.rank === 1 && (
                          <div className="text-sm text-white/80 font-medium mt-1">
                            🎉 현재 1등!
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div
                      className={`text-2xl md:text-3xl font-black flex-shrink-0 ${
                        isPodium ? 'text-white' : 'text-primary-600'
                      }`}
                    >
                      {entry.score}
                      <span className="text-lg md:text-xl ml-1">점</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Next Button (Organizer only) */}
        {isOrganizer && onNextQuestion && (
          <div className="text-center">
            <button
              onClick={onNextQuestion}
              className="px-12 py-6 bg-white hover:bg-gray-50 active:bg-gray-100 text-primary-600 font-black text-2xl rounded-2xl transition-all duration-200 hover:scale-105 active:scale-100 cursor-pointer shadow-2xl hover:shadow-xl"
            >
              {isLastQuestion ? '🎉 게임 종료' : '다음 문제 →'}
            </button>
            <p className="text-white/90 mt-4 text-lg font-medium">
              {isLastQuestion ? '최종 결과를 확인하세요' : '준비되면 클릭하세요'}
            </p>
          </div>
        )}

        {/* Waiting message (Participants) */}
        {!isOrganizer && (
          <div className="text-center" role="status" aria-live="polite">
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-sm rounded-2xl">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" aria-hidden="true"></div>
              <p className="text-white font-semibold text-xl">
                주최자가 다음 문제를 준비하고 있습니다...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
