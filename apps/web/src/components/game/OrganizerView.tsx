'use client';

import { Timer } from './Timer';
import { NextQuestionCountdown } from './NextQuestionCountdown';
import { QuestionMedia } from './QuestionMedia';
import type { Question, Player, LeaderboardEntry } from '@/lib/websocket/types';
import { usePluginRegistry } from '@/lib/plugins/usePluginRegistry';

interface OrganizerViewProps {
  pin: string;
  currentQuestion: Question;
  questionIndex: number;
  totalQuestions: number;
  duration: number;
  currentQuestionStartedAt?: Date | string;
  players: Player[];
  leaderboard: LeaderboardEntry[];
  showResults: boolean;
  onEndQuestion: () => void;
  onNextQuestion?: () => void;
}

export function OrganizerView({
  pin,
  currentQuestion,
  questionIndex,
  totalQuestions,
  duration,
  currentQuestionStartedAt,
  players,
  leaderboard,
  showResults,
  onEndQuestion,
  onNextQuestion,
}: OrganizerViewProps) {
  const pluginRegistry = usePluginRegistry();
  const questionData = currentQuestion.data;

  const answeredCount = players.filter((p) => p.answers[questionIndex] !== undefined).length;

  // Calculate answer statistics for the plugin
  const answerStats: Record<string, number> = {};
  if (questionData.options) {
    questionData.options.forEach((option) => {
      answerStats[option] = 0;
    });

    players.forEach((player) => {
      const answer = String(player.answers[questionIndex]?.answer || '');
      if (answer && answerStats[answer] !== undefined) {
        answerStats[answer]++;
      }
    });
  }

  // Transform players to match plugin's expected participants format
  const participants = players.map((player) => ({
    id: player.id,
    nickname: player.nickname,
    score: player.score,
    hasAnswered: player.answers[questionIndex] !== undefined,
    answer: player.answers[questionIndex]?.answer,
    isCorrect: player.answers[questionIndex]?.isCorrect,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4 md:p-8">
      <NextQuestionCountdown show={showResults} duration={5} />
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-lg font-semibold text-gray-600">
              Q {questionIndex + 1} / {totalQuestions}
            </span>
            <div className="flex items-center gap-4">
              <div className="bg-primary-500 text-white px-4 py-2 rounded-lg font-bold text-lg">
                PIN: {pin}
              </div>
            </div>
          </div>

          {!showResults && (
            <Timer duration={duration} onTimeUp={onEndQuestion} startedAt={currentQuestionStartedAt} />
          )}

          <div className="mt-8 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
              {currentQuestion.content}
            </h2>

            <QuestionMedia
              imageUrl={currentQuestion.imageUrl}
              videoUrl={currentQuestion.videoUrl}
              audioUrl={currentQuestion.audioUrl}
              autoPlay={true}
            />

            <div className="mt-8">
              {(() => {
                const plugin = pluginRegistry.get(questionData.type);

                if (!plugin) {
                  return (
                    <div className="text-center text-red-600">
                      <p>지원하지 않는 질문 유형입니다: {questionData.type}</p>
                    </div>
                  );
                }

                return plugin.renderOrganizerView({
                  questionData,
                  questionIndex,
                  totalQuestions,
                  duration,
                  currentQuestionStartedAt,
                  participants,
                  answerStats,
                  leaderboard,
                });
              })()}
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                응답 현황 ({answeredCount}/{players.length}명 응답)
              </h3>
              {showResults && onNextQuestion && (
                <button
                  onClick={onNextQuestion}
                  className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  다음 문제 →
                </button>
              )}
            </div>

            {!showResults && (
              <div className="text-center py-4">
                <p className="text-gray-600 text-sm">
                  {answeredCount === players.length && players.length > 0
                    ? '모든 참가자가 답변했습니다. 곧 정답이 공개됩니다...'
                    : '참가자들의 답변을 기다리는 중...'}
                </p>
              </div>
            )}

            {showResults && leaderboard.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">🏆 현재 TOP 5</h4>
                <div className="space-y-2">
                  {leaderboard.slice(0, 5).map((entry) => (
                    <div
                      key={`top5-${entry.rank}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary-500 w-6">{entry.rank}.</span>
                        <span className="font-medium text-gray-900">{entry.nickname}</span>
                      </div>
                      <span className="font-bold text-primary-600">{entry.score}점</span>
                    </div>
                  ))}
                </div>

                {!onNextQuestion && (
                  <div className="mt-4 text-center py-3 bg-primary-50 rounded-lg">
                    <p className="text-primary-700 font-medium">
                      {questionIndex + 1 < totalQuestions
                        ? '5초 후 다음 문제로 이동합니다...'
                        : '5초 후 게임이 종료됩니다...'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
