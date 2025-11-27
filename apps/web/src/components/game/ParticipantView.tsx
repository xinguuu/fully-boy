'use client';

import { Timer } from './Timer';
import { AnswerSubmittedScreen } from './AnswerSubmittedScreen';
import { ScoreAnimation } from './ScoreAnimation';
import { NextQuestionCountdown } from './NextQuestionCountdown';
import { QuestionMedia } from './QuestionMedia';
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
  selectedAnswer?: string | null;
  shortAnswerInput?: string;
  hasAnswered?: boolean;
  questionEnded?: boolean;
  lastAnswer?: PlayerAnswer;
  currentScore?: number;
  currentRank?: number;
  phase?: GamePhase;
  onAnswerSelect?: (answer: string) => void;
  onShortAnswerChange?: (value: string) => void;
  onShortAnswerSubmit?: (e: React.FormEvent) => void;
  /** Preview mode: static display, no interactions */
  isPreview?: boolean;
  /** Custom class for container (useful for scaled preview) */
  className?: string;
  /** Current answer streak count */
  streak?: number;
}

export function ParticipantView({
  currentQuestion,
  questionIndex,
  totalQuestions,
  duration,
  currentQuestionStartedAt,
  selectedAnswer = null,
  shortAnswerInput = '',
  hasAnswered = false,
  questionEnded = false,
  lastAnswer,
  currentScore = 150,
  currentRank = 3,
  phase = 'ANSWERING',
  onAnswerSelect,
  onShortAnswerChange,
  onShortAnswerSubmit,
  isPreview = false,
  className,
  streak = 0,
}: ParticipantViewProps) {
  const pluginRegistry = usePluginRegistry();
  const questionData = currentQuestion.data;

  // Phase 1: Answer submitted, waiting (skip in preview mode)
  if (!isPreview && phase === 'SUBMITTED' && hasAnswered && !questionEnded) {
    return (
      <AnswerSubmittedScreen
        selectedAnswer={selectedAnswer || shortAnswerInput}
        duration={duration}
        startedAt={currentQuestionStartedAt}
      />
    );
  }

  // Phase 2: Answer reveal with score animation (skip in preview mode)
  if (!isPreview && (phase === 'ANSWER_REVEAL' || phase === 'LEADERBOARD') && questionEnded && lastAnswer) {
    const isBalanceGame = questionData.type === 'balance-game';

    // Balance Game: Show voting result screen (no correct answer)
    if (isBalanceGame) {
      const userChoice = lastAnswer.answer as string;
      const choiceLabel = userChoice === 'A' ? questionData.optionA : questionData.optionB;

      return (
        <>
          <ScoreAnimation
            isCorrect={true}
            points={lastAnswer.points}
            message="투표 완료!"
          />
          <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4 flex items-center justify-center">
            <div className="max-w-2xl w-full">
              <NextQuestionCountdown show={true} duration={5} variant="inline" />

              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 animate-slide-up">
                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    {currentQuestion.content}
                  </h2>

                  <div className={`p-6 rounded-xl border-4 transition-all duration-300 ${
                    userChoice === 'A'
                      ? 'bg-red-50 border-red-400'
                      : 'bg-blue-50 border-blue-400'
                  }`}>
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold ${
                        userChoice === 'A' ? 'bg-red-500' : 'bg-blue-500'
                      }`}>
                        {userChoice}
                      </div>
                      <h3 className={`font-bold text-2xl ${
                        userChoice === 'A' ? 'text-red-700' : 'text-blue-700'
                      }`}>
                        {choiceLabel}
                      </h3>
                    </div>

                    <p className="text-gray-600 mt-4">
                      결과 화면에서 투표 결과를 확인하세요!
                    </p>
                  </div>

                  <div className="mt-8 flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="text-left">
                      <p className="text-sm text-gray-600">현재 점수</p>
                      <p className="text-2xl font-bold text-primary-600">{currentScore}점</p>
                    </div>
                    {currentRank && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">순위</p>
                        <p className="text-2xl font-bold text-secondary-600">{currentRank}등</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    // Regular quiz: Show correct/incorrect result
    return (
      <>
        <ScoreAnimation
          isCorrect={lastAnswer.isCorrect}
          points={lastAnswer.points}
          message={lastAnswer.isCorrect ? undefined : '다음 문제에서 도전하세요!'}
          streak={lastAnswer.isCorrect ? streak : 0}
        />
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4 flex items-center justify-center">
          <div className="max-w-2xl w-full">
            <NextQuestionCountdown show={true} duration={5} variant="inline" />

            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 animate-slide-up">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  {currentQuestion.content}
                </h2>
                <div
                  className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                    lastAnswer.isCorrect
                      ? 'bg-success-light/50 border-success'
                      : 'bg-error-light/50 border-error'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        lastAnswer.isCorrect ? 'bg-success' : 'bg-error'
                      }`}
                    >
                      <span className="text-2xl text-white">
                        {lastAnswer.isCorrect ? '✓' : '✗'}
                      </span>
                    </div>
                    <h3
                      className={`font-bold text-2xl ${
                        lastAnswer.isCorrect ? 'text-success-dark' : 'text-error-dark'
                      }`}
                    >
                      {lastAnswer.isCorrect ? '정답입니다!' : '오답입니다'}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-white/70 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">정답</p>
                      <p className="text-xl font-bold text-gray-900">{questionData.correctAnswer}</p>
                    </div>

                    {lastAnswer.isCorrect && (
                      <div className="bg-success/10 rounded-lg p-4">
                        <p className="text-success-dark font-semibold text-lg">
                          +{lastAnswer.points}점 획득!
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between bg-gray-50 rounded-lg p-4">
                  <div className="text-left">
                    <p className="text-sm text-gray-600">현재 점수</p>
                    <p className="text-2xl font-bold text-primary-600">{currentScore}점</p>
                  </div>
                  {currentRank && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">순위</p>
                      <p className="text-2xl font-bold text-secondary-600">{currentRank}등</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Phase 3: Answering
  // Handlers with fallback for preview mode or when not provided
  const handleAnswerSelect = isPreview ? () => {} : (onAnswerSelect ?? (() => {}));
  const handleShortAnswerChange = isPreview ? () => {} : (onShortAnswerChange ?? (() => {}));
  const handleShortAnswerSubmit = isPreview
    ? (e: React.FormEvent) => e.preventDefault()
    : (onShortAnswerSubmit ?? ((e: React.FormEvent) => e.preventDefault()));

  return (
    <div className={className || "min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4 flex items-center justify-center"}>
      <div className={isPreview ? "w-full h-full" : "max-w-2xl w-full"}>
        <div className={isPreview ? "h-full flex flex-col" : "bg-white rounded-2xl shadow-xl p-6 md:p-8"}>
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

          <Timer
            duration={duration}
            startedAt={isPreview ? undefined : currentQuestionStartedAt}
            isPreview={isPreview}
          />

          <div className="mt-8 mb-8 flex-1">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
              {currentQuestion.content}
            </h2>

            <QuestionMedia
              imageUrl={currentQuestion.imageUrl}
              videoUrl={currentQuestion.videoUrl}
              audioUrl={currentQuestion.audioUrl}
              mediaSettings={currentQuestion.mediaSettings}
              autoPlay={!isPreview}
            />

            {(() => {
              const plugin = pluginRegistry.get(questionData.type);

              if (!plugin) {
                return (
                  <div className="text-center text-red-600">
                    <p>지원하지 않는 질문 유형입니다: {questionData.type}</p>
                  </div>
                );
              }

              if (!plugin.renderParticipantView) {
                return (
                  <div className="text-center text-red-600">
                    <p>이 게임 유형은 참가자 뷰를 지원하지 않습니다.</p>
                  </div>
                );
              }

              return plugin.renderParticipantView({
                questionData,
                questionIndex,
                totalQuestions,
                duration,
                currentQuestionStartedAt: isPreview ? undefined : currentQuestionStartedAt,
                hasAnswered: isPreview ? false : hasAnswered,
                questionEnded: isPreview ? false : questionEnded,
                currentScore,
                currentRank,
                selectedAnswer: isPreview ? null : selectedAnswer,
                shortAnswerInput: isPreview ? '' : shortAnswerInput,
                onAnswerSelect: handleAnswerSelect,
                onShortAnswerChange: handleShortAnswerChange,
                onShortAnswerSubmit: handleShortAnswerSubmit,
                lastAnswer: isPreview ? undefined : lastAnswer,
              });
            })()}
          </div>

          {!isPreview && hasAnswered && !questionEnded && (
            <p className="text-center text-gray-500 text-sm">
              답안이 제출되었습니다. 결과를 기다려주세요...
            </p>
          )}

          {!isPreview && !hasAnswered && (
            <p className="text-center text-gray-500 text-sm">답을 선택하세요</p>
          )}
        </div>
      </div>
    </div>
  );
}
