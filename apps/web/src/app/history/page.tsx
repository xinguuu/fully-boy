'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Users, Clock, Trophy, Eye } from 'lucide-react';
import { useGames, useAuth } from '@/lib/hooks';
import { resultsApi } from '@/lib/api/results';
import type { GameResult } from '@/types/result.types';
import { formatDate, formatDuration, getRelativeTime } from '@/types/result.types';
import { Footer } from '@/components/layout/Footer';
import { logger } from '@/lib/logger';

export default function HistoryPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { data: myGames = [], isLoading: gamesLoading } = useGames();
  const [allResults, setAllResults] = useState<(GameResult & { gameTitle?: string })[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch all results for user's games
  useEffect(() => {
    if (myGames.length === 0) {
      setIsLoadingResults(false);
      return;
    }

    const fetchAllResults = async () => {
      setIsLoadingResults(true);
      setError(null);

      try {
        // Fetch results for each game
        const resultsPromises = myGames.map(async (game) => {
          try {
            const response = await resultsApi.getGameResults(game.id, 50);
            if (!response || !response.results) {
              logger.error(`Invalid response for game ${game.id}:`, response);
              return [];
            }
            return response.results.map((result) => ({
              ...result,
              gameTitle: game.title,
            }));
          } catch (err) {
            logger.error(`Failed to fetch results for game ${game.id}:`, err);
            return [];
          }
        });

        const resultsArrays = await Promise.all(resultsPromises);
        const flatResults = resultsArrays.flat();

        // Sort by date (newest first)
        flatResults.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setAllResults(flatResults);
      } catch (err) {
        logger.error('Failed to fetch results:', err);
        setError('게임 기록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoadingResults(false);
      }
    };

    fetchAllResults();
  }, [myGames]);

  const isLoading = authLoading || gamesLoading || isLoadingResults;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-secondary-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push('/browse')}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-500 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">뒤로</span>
          </button>

          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
            플레이 기록
          </h1>

          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-error-light border border-error text-error-dark p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Summary */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white mb-8 shadow-lg">
          <h2 className="text-3xl font-bold mb-2">총 {allResults.length}번 플레이</h2>
          <p className="text-primary-50">
            {myGames.length}개의 게임으로 진행한 기록입니다
          </p>
        </div>

        {/* Results List */}
        {allResults.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎮</div>
            <p className="text-gray-500 text-lg mb-4">아직 플레이 기록이 없습니다</p>
            <p className="text-gray-400 mb-6">게임을 만들고 진행해보세요!</p>
            <button
              onClick={() => router.push('/browse')}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer"
            >
              게임 둘러보기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {allResults.map((result) => (
              <ResultCard
                key={result.id}
                result={result}
                onViewDetails={() => router.push(`/results/${result.roomId}`)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

interface ResultCardProps {
  result: GameResult & { gameTitle?: string };
  onViewDetails: () => void;
}

function ResultCard({ result, onViewDetails }: ResultCardProps) {
  const winner = result.leaderboard[0];

  return (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary-300">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Game Info */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {result.gameTitle || '게임'}
          </h3>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {getRelativeTime(result.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {result.participantCount}명
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDuration(result.duration)}
            </span>
          </div>

          {/* Winner */}
          {winner && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-gray-800">
                1등: {winner.nickname} ({winner.score}점)
              </span>
            </div>
          )}
        </div>

        {/* Right: Action Button */}
        <button
          onClick={onViewDetails}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          결과 보기
        </button>
      </div>

      {/* Detailed Date (hover) */}
      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
        {formatDate(result.createdAt)}
      </div>
    </div>
  );
}
