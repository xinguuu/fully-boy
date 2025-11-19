'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGameSocket, useAuth } from '@/lib/hooks';
import { Timer } from '@/components/game/Timer';

export default function LiveGamePage() {
  const params = useParams();
  const router = useRouter();
  const pin = params.pin as string;
  const { user, isLoading: authLoading } = useAuth();

  // Try to get nickname and participantId from localStorage
  const storedNickname =
    typeof window !== 'undefined' ? localStorage.getItem(`room_${pin}_nickname`) : null;
  const storedParticipantId =
    typeof window !== 'undefined' ? localStorage.getItem(`room_${pin}_participantId`) : null;

  // Determine if organizer (has user auth but no nickname)
  const isOrganizerByAuth = !!user && !storedNickname;

  const [nickname, setNickname] = useState(storedNickname || '');
  const [hasJoined, setHasJoined] = useState(!!storedNickname || isOrganizerByAuth);
  const [answerStartTime, setAnswerStartTime] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showQuestionIntro, setShowQuestionIntro] = useState(false);

  const {
    isConnected,
    roomState,
    game,
    currentQuestion,
    currentQuestionStartedAt,
    players,
    leaderboard,
    lastAnswer,
    questionEnded,
    error,
    sessionRestored: _sessionRestored,
    joinRoom,
    submitAnswer,
    endQuestion,
  } = useGameSocket({
    pin,
    nickname: storedNickname || undefined,
    participantId: storedParticipantId || undefined,
    autoJoin: !!storedNickname || isOrganizerByAuth, // Auto-join for both organizer and participant
  });

  const currentPlayer = roomState && players.find((p) => p.nickname === nickname);
  const isOrganizer = isOrganizerByAuth || currentPlayer?.isOrganizer || false;

  const hasAnswered =
    currentPlayer && currentQuestion
      ? currentPlayer.answers[roomState!.currentQuestionIndex] !== undefined
      : false;

  useEffect(() => {
    if (!currentQuestion) return;

    setShowQuestionIntro(true);
    setSelectedAnswer(null);
    setShowResults(false);

    // Show intro for 2 seconds, then show the question
    const timer = setTimeout(() => {
      setShowQuestionIntro(false);
      setAnswerStartTime(Date.now());
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentQuestion]);

  // Sync showResults with questionEnded for organizer
  useEffect(() => {
    if (questionEnded) {
      setShowResults(true);
    }
  }, [questionEnded]);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    joinRoom(nickname);
    setHasJoined(true);
  };

  const handleAnswerSelect = (answer: string) => {
    if (hasAnswered || !answerStartTime) return;

    const responseTimeMs = Date.now() - answerStartTime;
    setSelectedAnswer(answer);
    submitAnswer(answer, responseTimeMs);
  };

  const handleEndQuestion = () => {
    endQuestion();
    setShowResults(true);
  };

  // Show loading while checking authentication (for organizers)
  if (authLoading && !storedNickname) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">인증 확인 중...</p>
          <p className="text-gray-500 mt-2">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  // Show loading state if participant already joined via REST but WebSocket is connecting
  if (storedNickname && !isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">게임 연결 중...</p>
          <p className="text-gray-500 mt-2">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  // Show nickname form if no stored nickname and not joined
  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">게임 참여</h1>
          <p className="text-gray-600 mb-6 text-center">닉네임을 입력하세요</p>

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
                닉네임
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임 입력"
                className="h-11 w-full px-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-200 hover:border-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none"
                maxLength={20}
                required
              />
            </div>

            <button
              type="submit"
              disabled={!nickname.trim() || !isConnected}
              className="w-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-100 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              {isConnected ? '참여하기' : '연결 중...'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-error-light border-l-4 border-error rounded text-error-dark text-sm">
              {error.message}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!roomState || roomState.status === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">게임 시작 대기 중...</p>
          <p className="text-gray-500 mt-2">진행자가 게임을 시작할 때까지 기다려주세요</p>
        </div>
      </div>
    );
  }

  if (roomState.status === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
          <h1 className="text-4xl font-bold text-center mb-8">🎉 게임 종료!</h1>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">🏆 최종 순위</h2>
            <div className="space-y-3">
              {leaderboard.slice(0, 10).map((entry) => (
                <div
                  key={`final-${entry.rank}`}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    entry.rank <= 3 ? 'bg-gradient-to-r from-accent-100 to-accent-50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-primary-500 w-8">
                      {entry.rank === 1 && '🥇'}
                      {entry.rank === 2 && '🥈'}
                      {entry.rank === 3 && '🥉'}
                      {entry.rank > 3 && `${entry.rank}위`}
                    </span>
                    <span className="font-semibold text-gray-900">{entry.nickname}</span>
                  </div>
                  <span className="text-xl font-bold text-primary-600">{entry.score}점</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => router.push('/browse')}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition-all hover:scale-105 cursor-pointer"
          >
            게임 목록으로
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">문제를 불러오는 중...</p>
          <p className="text-gray-500 mt-2">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  const questionData = currentQuestion.data;
  const duration = questionData.duration || 30;
  const questionIndex = roomState.currentQuestionIndex;
  const totalQuestions = game?.questions.length || 0;

  // Show question intro screen
  if (showQuestionIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-4">
        <div className="text-center animate-pulse">
          <div className="text-white/80 text-2xl font-medium mb-4">문제</div>
          <div className="text-white text-8xl md:text-9xl font-bold mb-4">
            {questionIndex + 1}
            <span className="text-white/60">/{totalQuestions}</span>
          </div>
          <div className="text-white/60 text-lg">준비하세요!</div>
        </div>
      </div>
    );
  }

  if (isOrganizer) {
    const answeredCount = players.filter((p) => p.answers[questionIndex] !== undefined).length;
    const answerDistribution: Record<string, number> = {};

    if (questionData.options) {
      questionData.options.forEach((option) => {
        answerDistribution[option] = 0;
      });

      players.forEach((player) => {
        const answer = player.answers[questionIndex]?.answer as string;
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

            {!showResults && <Timer duration={duration} onTimeUp={handleEndQuestion} startedAt={currentQuestionStartedAt || undefined} />}

            <div className="mt-8 mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
                {currentQuestion.content}
              </h2>

              {(questionData.type === 'multiple-choice' || questionData.type === 'true-false') && questionData.options && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  {questionData.options.map((option, idx) => {
                    const count = answerDistribution[option] || 0;
                    const percentage =
                      answeredCount > 0 ? Math.round((count / answeredCount) * 100) : 0;

                    return (
                      <div
                        key={idx}
                        className="relative p-6 border-2 border-gray-200 rounded-xl bg-gray-50 overflow-hidden"
                      >
                        <div
                          className="absolute inset-0 bg-primary-100 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xl font-bold text-gray-900">
                              {questionData.type === 'multiple-choice' && `${String.fromCharCode(65 + idx)}. `}
                              {option}
                            </span>
                            <span className="text-lg font-semibold text-primary-600">
                              {percentage}%
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">{count}명 선택</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  응답 현황 ({answeredCount}/{players.length}명 응답)
                </h3>
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

                  <div className="mt-4 text-center py-3 bg-primary-50 rounded-lg">
                    <p className="text-primary-700 font-medium">
                      {questionIndex + 1 < totalQuestions
                        ? '5초 후 다음 문제로 이동합니다...'
                        : '5초 후 게임이 종료됩니다...'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <span className="text-lg font-semibold text-gray-600">
              Q {questionIndex + 1} / {totalQuestions}
            </span>
            <span className="text-lg font-semibold text-primary-600">
              내 점수: {currentPlayer?.score || 0}점
            </span>
          </div>

          <Timer duration={duration} startedAt={currentQuestionStartedAt || undefined} />

          <div className="mt-8 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
              {currentQuestion.content}
            </h2>

            {(questionData.type === 'multiple-choice' || questionData.type === 'true-false') && questionData.options && (
              <div className="grid grid-cols-1 gap-4">
                {questionData.options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = questionEnded && lastAnswer?.answer === option && lastAnswer?.isCorrect;
                  const isWrong = questionEnded && lastAnswer?.answer === option && !lastAnswer?.isCorrect;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={hasAnswered}
                      className={`p-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                        isCorrect
                          ? 'bg-success text-white'
                          : isWrong
                            ? 'bg-error text-white'
                            : isSelected
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      } ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                    >
                      {questionData.type === 'multiple-choice' && (
                        <span className="mr-3">{String.fromCharCode(65 + idx)}.</span>
                      )}
                      {option}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {hasAnswered && !questionEnded && (
            <p className="text-center text-gray-500 text-sm">답안이 제출되었습니다. 결과를 기다려주세요...</p>
          )}

          {hasAnswered && questionEnded && lastAnswer && (
            <div
              className={`p-4 rounded-lg border-l-4 ${lastAnswer.isCorrect ? 'bg-success-light border-success' : 'bg-error-light border-error'}`}
            >
              <h3
                className={`font-semibold mb-2 ${lastAnswer.isCorrect ? 'text-success-dark' : 'text-error-dark'}`}
              >
                {lastAnswer.isCorrect ? '✅ 정답입니다!' : '❌ 오답입니다'}
              </h3>
              <p className="text-sm text-gray-700">
                {lastAnswer.isCorrect && `+${lastAnswer.points}점 획득!`}
                {!lastAnswer.isCorrect && '다음 문제에서 도전하세요'}
              </p>
            </div>
          )}

          {!hasAnswered && (
            <p className="text-center text-gray-500 text-sm">답을 선택하세요</p>
          )}
        </div>
      </div>
    </div>
  );
}
