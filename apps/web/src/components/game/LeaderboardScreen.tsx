'use client';

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
  const isLastQuestion = questionIndex + 1 >= totalQuestions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            🏆 순위표
          </h1>
          <p className="text-xl md:text-2xl text-white/80">
            {questionIndex + 1}번 문제 종료
          </p>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 mb-8 animate-scale-in">
          <div className="space-y-3">
            {leaderboard.slice(0, 10).map((entry, idx) => {
              const isPodium = entry.rank <= 3;
              const medalColors = {
                1: 'from-yellow-400 to-yellow-600',
                2: 'from-gray-300 to-gray-500',
                3: 'from-orange-400 to-orange-600',
              };

              return (
                <div
                  key={`leaderboard-${entry.rank}`}
                  className={`flex items-center justify-between p-4 md:p-6 rounded-2xl transition-all duration-500 transform hover:scale-[1.02] animate-slide-in-right ${
                    isPodium
                      ? `bg-gradient-to-r ${medalColors[entry.rank as 1 | 2 | 3]} text-white shadow-xl`
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  style={{
                    animationDelay: `${idx * 100}ms`,
                  }}
                >
                  <div className="flex items-center gap-4 md:gap-6">
                    {/* Rank */}
                    <div
                      className={`text-3xl md:text-4xl font-black min-w-[60px] text-center ${
                        isPodium ? 'text-white' : 'text-gray-400'
                      }`}
                    >
                      {entry.rank === 1 && '🥇'}
                      {entry.rank === 2 && '🥈'}
                      {entry.rank === 3 && '🥉'}
                      {entry.rank > 3 && `${entry.rank}`}
                    </div>

                    {/* Nickname */}
                    <div>
                      <div
                        className={`text-xl md:text-2xl font-bold ${
                          isPodium ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {entry.nickname}
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
                    className={`text-2xl md:text-3xl font-black ${
                      isPodium ? 'text-white' : 'text-indigo-600'
                    }`}
                  >
                    {entry.score}
                    <span className="text-lg md:text-xl ml-1">점</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Button (Organizer only) */}
        {isOrganizer && onNextQuestion && (
          <div className="text-center animate-bounce-slow">
            <button
              onClick={onNextQuestion}
              className="px-12 py-6 bg-white hover:bg-gray-100 active:bg-gray-200 text-indigo-600 font-black text-2xl rounded-2xl transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shadow-2xl hover:shadow-3xl transform"
            >
              {isLastQuestion ? '🎉 게임 종료' : '다음 문제 →'}
            </button>
            <p className="text-white/80 mt-4 text-lg">
              {isLastQuestion ? '최종 결과를 확인하세요' : '준비되면 클릭하세요'}
            </p>
          </div>
        )}

        {/* Waiting message (Participants) */}
        {!isOrganizer && (
          <div className="text-center animate-pulse">
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-sm rounded-2xl">
              <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
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
