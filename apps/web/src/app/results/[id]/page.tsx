'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Trophy, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useResultByRoom } from '@/lib/hooks';
import { formatDate, formatDuration } from '@/types/result.types';
import { Footer } from '@/components/layout/Footer';
import { logger } from '@/lib/logger';

export default function ResultDetailPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params?.id as string;

  const { data: result, isLoading, error } = useResultByRoom(roomId);

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

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <p className="text-xl font-semibold text-gray-700 mb-4">결과를 불러올 수 없습니다</p>
          <button
            onClick={() => router.push('/history')}
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            기록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: '게임 결과',
          text: `게임 결과를 확인하세요! 총 ${result.participantCount}명 참가`,
          url,
        })
        .catch((err) => logger.error('Share failed:', err));
    } else {
      navigator.clipboard.writeText(url);
      toast.success('링크가 클립보드에 복사되었습니다!');
    }
  };

  const handleDownload = () => {
    // TODO: Implement PDF download
    toast.info('PDF 다운로드 기능은 준비 중입니다.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-secondary-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-500 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">뒤로</span>
          </button>

          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
            게임 결과
          </h1>

          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Card */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-8 text-white mb-8 shadow-xl">
          <h2 className="text-4xl font-bold mb-4">🎉 게임 종료</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-primary-100 text-sm mb-1">총 참가자</div>
              <div className="text-3xl font-bold">{result.participantCount}명</div>
            </div>
            <div>
              <div className="text-primary-100 text-sm mb-1">평균 점수</div>
              <div className="text-3xl font-bold">{Math.round(result.averageScore)}점</div>
            </div>
            <div>
              <div className="text-primary-100 text-sm mb-1">소요 시간</div>
              <div className="text-3xl font-bold">{formatDuration(result.duration)}</div>
            </div>
          </div>
          <div className="mt-6 text-primary-100 text-sm">
            플레이 날짜: {formatDate(result.createdAt)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span className="font-medium">공유하기</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span className="font-medium">PDF 다운로드</span>
          </button>
        </div>

        {/* Final Leaderboard */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            최종 순위
          </h3>

          <div className="space-y-3">
            {result.leaderboard.map((entry, index) => {
              const isTopThree = index < 3;
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;

              return (
                <div
                  key={`${entry.playerId}-${entry.rank}`}
                  className={`
                    flex items-center gap-4 p-4 rounded-lg transition-all
                    ${
                      isTopThree
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-md'
                        : 'bg-gray-50 border border-gray-200'
                    }
                  `}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 text-center">
                    {medal ? (
                      <span className="text-3xl">{medal}</span>
                    ) : (
                      <span className="text-2xl font-bold text-gray-600">{entry.rank}</span>
                    )}
                  </div>

                  {/* Nickname */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-lg font-bold truncate ${
                        isTopThree ? 'text-gray-900' : 'text-gray-700'
                      }`}
                    >
                      {entry.nickname}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0">
                    <div
                      className={`
                        px-4 py-2 rounded-lg font-bold
                        ${
                          isTopThree
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }
                      `}
                    >
                      {entry.score}점
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Return Button */}
        <div className="text-center">
          <button
            onClick={() => router.push('/history')}
            className="px-8 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer"
          >
            기록 목록으로 돌아가기
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
