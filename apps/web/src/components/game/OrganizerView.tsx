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
}: OrganizerViewProps) {
  const pluginRegistry = usePluginRegistry();
  const questionData = currentQuestion.data;

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
