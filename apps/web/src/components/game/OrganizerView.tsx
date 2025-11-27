'use client';

import { Timer } from './Timer';
import { NextQuestionCountdown } from './NextQuestionCountdown';
import { QuestionMedia } from './QuestionMedia';
import { AnswerCounter } from './AnswerCounter';
import { SoundToggle } from './SoundToggle';
import type { Question, Player, LeaderboardEntry } from '@/lib/websocket/types';
import { usePluginRegistry } from '@/lib/plugins/usePluginRegistry';

interface OrganizerViewProps {
  pin: string;
  currentQuestion: Question;
  questionIndex: number;
  totalQuestions: number;
  duration: number;
  currentQuestionStartedAt?: Date | string;
  players?: Player[];
  leaderboard?: LeaderboardEntry[];
  showResults?: boolean;
  onEndQuestion?: () => void;
  /** Preview mode: static display, no interactions */
  isPreview?: boolean;
  /** Custom class for container (useful for scaled preview) */
  className?: string;
}

export function OrganizerView({
  pin,
  currentQuestion,
  questionIndex,
  totalQuestions,
  duration,
  currentQuestionStartedAt,
  players = [],
  leaderboard = [],
  showResults = false,
  onEndQuestion,
  isPreview = false,
  className,
}: OrganizerViewProps) {
  const pluginRegistry = usePluginRegistry();
  const questionData = currentQuestion.data;

  // Calculate answer statistics for the plugin
  let answerStats: Record<string, number> = {};

  if (isPreview) {
    // Generate dummy stats for preview mode
    if (questionData.type === 'balance-game') {
      answerStats = { 'A': 11, 'B': 9 };
    } else if (questionData.type === 'true-false') {
      answerStats = { 'O': 12, 'X': 8 };
    } else if (questionData.options) {
      const distribution = [7, 9, 2, 2];
      questionData.options.forEach((option, i) => {
        answerStats[option] = distribution[i] || 0;
      });
    }
  } else {
    if (questionData.type === 'balance-game') {
      answerStats['A'] = 0;
      answerStats['B'] = 0;

      players.forEach((player) => {
        const answer = String(player.answers[questionIndex]?.answer || '');
        if (answer === 'A' || answer === 'B') {
          answerStats[answer]++;
        }
      });
    } else if (questionData.options) {
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
  }

  // Transform players to match plugin's expected participants format
  const participants = isPreview
    ? Array.from({ length: 20 }, (_, i) => ({
        id: `preview-${i}`,
        nickname: `Player${i + 1}`,
        score: Math.floor(Math.random() * 500),
        hasAnswered: i < 15,
        answer: undefined,
        isCorrect: undefined,
      }))
    : players.map((player) => ({
        id: player.id,
        nickname: player.nickname,
        score: player.score,
        hasAnswered: player.answers[questionIndex] !== undefined,
        answer: player.answers[questionIndex]?.answer,
        isCorrect: player.answers[questionIndex]?.isCorrect,
      }));

  const answeredCount = participants.filter((p) => p.hasAnswered).length;
  const totalParticipants = participants.filter((p) => !players.find((pl) => pl.id === p.id && pl.isOrganizer)).length;

  return (
    <div className={className || "min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4 md:p-8 relative"}>
      {!isPreview && <NextQuestionCountdown show={showResults} duration={5} />}
      {!isPreview && <SoundToggle className="absolute top-4 right-4" />}
      <div className={isPreview ? "" : "max-w-6xl mx-auto"}>
        <div className={isPreview ? "h-full flex flex-col" : "bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6"}>
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

          {!showResults && !isPreview && (
            <div className="mb-6">
              <AnswerCounter
                answered={answeredCount}
                total={totalParticipants}
                showResults={showResults}
              />
            </div>
          )}

          {!showResults && (
            <Timer
              duration={duration}
              onTimeUp={isPreview ? undefined : onEndQuestion}
              startedAt={isPreview ? undefined : currentQuestionStartedAt}
              isPreview={isPreview}
            />
          )}

          <div className="mt-8 mb-8 flex-1">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
              {currentQuestion.content}
            </h2>

            <QuestionMedia
              imageUrl={currentQuestion.imageUrl}
              videoUrl={currentQuestion.videoUrl}
              audioUrl={currentQuestion.audioUrl}
              mediaSettings={currentQuestion.mediaSettings}
              autoPlay={!isPreview}
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

                if (!plugin.renderOrganizerView) {
                  return (
                    <div className="text-center text-red-600">
                      <p>이 게임 유형은 진행자 뷰를 지원하지 않습니다.</p>
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
                  showResults,
                });
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
