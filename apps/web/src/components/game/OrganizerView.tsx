import { useRouter } from 'next/navigation';
import { Timer } from './Timer';
import { KAHOOT_COLORS } from '@/types/game.types';
import type { Question, Player, LeaderboardEntry } from '@/lib/websocket/types';

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
  const router = useRouter();
  const questionData = currentQuestion.data;

  const answeredCount = players.filter((p) => p.answers[questionIndex] !== undefined).length;
  const answerDistribution: Record<string, number> = {};

  if (questionData.options) {
    questionData.options.forEach((option) => {
      answerDistribution[option] = 0;
    });

    players.forEach((player) => {
      const answer = String(player.answers[questionIndex]?.answer || '');
      if (answer && answerDistribution[answer] !== undefined) {
        answerDistribution[answer]++;
      }
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-lg font-semibold text-gray-600">
              Q {questionIndex + 1} / {totalQuestions}
            </span>
            <button
              onClick={() => router.push(`/room/${pin}/waiting`)}
              className="text-error hover:text-error-dark font-medium cursor-pointer"
            >
              [종료]
            </button>
          </div>

          {!showResults && (
            <Timer duration={duration} onTimeUp={onEndQuestion} startedAt={currentQuestionStartedAt} />
          )}

          <div className="mt-8 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
              {currentQuestion.content}
            </h2>

            {(questionData.type === 'multiple-choice' || questionData.type === 'true-false') &&
              questionData.options && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  {questionData.options.map((option, idx) => {
                    const count = answerDistribution[option] || 0;
                    const percentage = answeredCount > 0 ? Math.round((count / answeredCount) * 100) : 0;
                    const color = KAHOOT_COLORS[idx % KAHOOT_COLORS.length];
                    const isCorrect = showResults && option === questionData.correctAnswer;

                    return (
                      <div
                        key={idx}
                        className={`
                          relative p-6 border-2 rounded-xl overflow-hidden transition-all
                          ${isCorrect ? 'border-success bg-success-light' : 'border-gray-200 bg-gray-50'}
                        `}
                      >
                        <div
                          className={`absolute inset-0 transition-all duration-500 ${color.bg} opacity-20`}
                          style={{ width: `${percentage}%` }}
                        />
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xl font-bold text-gray-900 flex items-center gap-2">
                              {questionData.type === 'multiple-choice' && (
                                <span
                                  className={`w-8 h-8 rounded-lg ${color.bg} text-white flex items-center justify-center text-sm font-black`}
                                >
                                  {String.fromCharCode(65 + idx)}
                                </span>
                              )}
                              {option}
                              {isCorrect && <span className="text-2xl">✓</span>}
                            </span>
                            <span className={`text-lg font-semibold ${color.text}`}>{percentage}%</span>
                          </div>
                          <div className="text-sm text-gray-600">{count}명 선택</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            {questionData.type === 'short-answer' && (
              <div className="mt-8">
                <div className="mb-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
                  <p className="text-sm font-medium text-primary-700">
                    💡 정답: <span className="font-bold">{questionData.correctAnswer}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {players
                    .filter((p) => p.answers[questionIndex]?.answer)
                    .map((player, idx) => {
                      const playerAnswer = player.answers[questionIndex];
                      const isCorrect = playerAnswer?.isCorrect || false;

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border-2 ${
                            isCorrect
                              ? 'bg-success-light border-success'
                              : 'bg-error-light border-error/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{player.nickname}</p>
                              <p
                                className={`text-sm mt-1 ${isCorrect ? 'text-success-dark' : 'text-error-dark'}`}
                              >
                                {String(playerAnswer.answer)}
                              </p>
                            </div>
                            <span className="text-xl flex-shrink-0">{isCorrect ? '✅' : '❌'}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {answeredCount === 0 && (
                  <div className="text-center py-8 text-gray-500">아직 제출된 답변이 없습니다</div>
                )}
              </div>
            )}
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
