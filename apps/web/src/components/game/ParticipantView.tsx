'use client';

import { Timer } from './Timer';
import { AnswerSubmittedScreen } from './AnswerSubmittedScreen';
import { ScoreAnimation } from './ScoreAnimation';
import { NextQuestionCountdown } from './NextQuestionCountdown';
import type { GamePhase } from '@/types/game.types';
import type { Question } from '@/lib/websocket/types';
import { usePluginRegistry } from '@/lib/plugins/usePluginRegistry';

interface PlayerAnswer {
  answer: unknown;
  isCorrect: boolean;
  points: number;
}

interface ParticipantViewProps {
  currentQuestion: Question;
  questionIndex: number;
  totalQuestions: number;
  duration: number;
  currentQuestionStartedAt?: Date | string;
  selectedAnswer: string | null;
  shortAnswerInput: string;
  hasAnswered: boolean;
  questionEnded: boolean;
  lastAnswer?: PlayerAnswer;
  currentScore: number;
  currentRank?: number;
  phase: GamePhase;
  onAnswerSelect: (answer: string) => void;
  onShortAnswerChange: (value: string) => void;
  onShortAnswerSubmit: (e: React.FormEvent) => void;
}

export function ParticipantView({
  currentQuestion,
  questionIndex,
  totalQuestions,
  duration,
  currentQuestionStartedAt,
  selectedAnswer,
  shortAnswerInput,
  hasAnswered,
  questionEnded,
  lastAnswer,
  currentScore,
  currentRank,
  phase,
  onAnswerSelect,
  onShortAnswerChange,
  onShortAnswerSubmit,
}: ParticipantViewProps) {
  const pluginRegistry = usePluginRegistry();
  const questionData = currentQuestion.data;

  // Phase 1: Answer submitted, waiting
  if (phase === 'SUBMITTED' && hasAnswered && !questionEnded) {
    return (
      <AnswerSubmittedScreen
        selectedAnswer={selectedAnswer || shortAnswerInput}
        duration={duration}
        startedAt={currentQuestionStartedAt}
      />
    );
  }

  // Phase 2: Answer reveal with score animation
  if (phase === 'ANSWER_REVEAL' && questionEnded && lastAnswer) {
    return (
      <>
        <ScoreAnimation
          isCorrect={lastAnswer.isCorrect}
          points={lastAnswer.points}
          message={lastAnswer.isCorrect ? undefined : '다음 문제에서 도전하세요!'}
        />
        <NextQuestionCountdown show={true} duration={5} />
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4 flex items-center justify-center">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {currentQuestion.content}
                </h2>
                <div
                  className={`p-6 rounded-lg border-l-4 ${lastAnswer.isCorrect ? 'bg-success-light border-success' : 'bg-error-light border-error'}`}
                >
                  <h3
                    className={`font-semibold text-xl mb-2 ${lastAnswer.isCorrect ? 'text-success-dark' : 'text-error-dark'}`}
                  >
                    {lastAnswer.isCorrect ? '✓ 정답입니다!' : '✗ 오답입니다'}
                  </h3>
                  <p className="text-lg text-gray-700">
                    정답: <strong>{questionData.correctAnswer}</strong>
                  </p>
                  {lastAnswer.isCorrect && (
                    <p className="text-lg text-success-dark mt-2">+{lastAnswer.points}점 획득!</p>
                  )}
                </div>
                <div className="mt-6 text-gray-600">
                  <p>다음 문제를 준비하세요...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Phase 3: Answering
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <span className="text-lg font-semibold text-gray-600">
              Q {questionIndex + 1} / {totalQuestions}
            </span>
            <div className="text-right">
              <div className="text-lg font-semibold text-primary-600">
                내 점수: {currentScore}점
              </div>
              {currentRank && (
                <div className="text-sm text-gray-500 mt-1">현재 {currentRank}등</div>
              )}
            </div>
          </div>

          <Timer duration={duration} startedAt={currentQuestionStartedAt} />

          <div className="mt-8 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
              {currentQuestion.content}
            </h2>

            {(() => {
              const plugin = pluginRegistry.get(questionData.type);

              if (!plugin) {
                return (
                  <div className="text-center text-red-600">
                    <p>지원하지 않는 질문 유형입니다: {questionData.type}</p>
                  </div>
                );
              }

              return plugin.renderParticipantView({
                questionData,
                questionIndex,
                totalQuestions,
                duration,
                currentQuestionStartedAt,
                hasAnswered,
                questionEnded,
                currentScore,
                currentRank,
                selectedAnswer,
                shortAnswerInput,
                onAnswerSelect,
                onShortAnswerChange,
                onShortAnswerSubmit,
                lastAnswer,
              });
            })()}
          </div>

          {hasAnswered && !questionEnded && (
            <p className="text-center text-gray-500 text-sm">
              답안이 제출되었습니다. 결과를 기다려주세요...
            </p>
          )}

          {!hasAnswered && (
            <p className="text-center text-gray-500 text-sm">답을 선택하세요</p>
          )}
        </div>
      </div>
    </div>
  );
}
