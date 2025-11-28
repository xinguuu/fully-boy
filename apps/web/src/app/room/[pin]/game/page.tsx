'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGameSocket, useAuth, useSound } from '@/lib/hooks';
import { ParticipantView } from '@/components/game/ParticipantView';
import { OrganizerView } from '@/components/game/OrganizerView';
import { LeaderboardScreen } from '@/components/game/LeaderboardScreen';
import { SoundToggle } from '@/components/game/SoundToggle';
import { Confetti } from '@/components/game/Confetti';
import { Podium } from '@/components/game/Podium';
import { STORAGE_KEYS } from '@/lib/constants/storage';
import { GAME_UI_TIMING, GAME_SETTINGS } from '@/lib/constants/game';
import { SOUND_TYPES } from '@/lib/constants/sounds';
import type { GamePhase } from '@/types/game.types';

export default function LiveGamePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const pin = params.pin as string;
  const { user, isLoading: authLoading } = useAuth();

  const storedNickname =
    typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.ROOM_NICKNAME(pin)) : null;
  const storedParticipantId =
    typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.ROOM_PARTICIPANT_ID(pin)) : null;
  const storedIsOrganizer =
    typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.ROOM_IS_ORGANIZER(pin)) === 'true' : false;

  const isOrganizerByAuth = !!user && (storedIsOrganizer || !storedNickname);

  const [nickname, setNickname] = useState(storedNickname || '');
  const [hasJoined, setHasJoined] = useState(!!storedNickname || isOrganizerByAuth);
  const [answerStartTime, setAnswerStartTime] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shortAnswerInput, setShortAnswerInput] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showQuestionIntro, setShowQuestionIntro] = useState(false);
  const [gamePhase, setGamePhase] = useState<GamePhase>('ANSWERING');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(8);
  const { playSound } = useSound();
  const hasPlayedVictorySoundRef = useRef(false);

  const {
    isConnected,
    connectionStatus,
    reconnectAttempt,
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
    nextQuestion,
  } = useGameSocket({
    pin,
    nickname: storedNickname || undefined,
    participantId: storedParticipantId || undefined,
    autoJoin: !!storedNickname || isOrganizerByAuth,
  });

  const currentPlayer = roomState && players.find((p) => p.nickname === nickname);
  const isOrganizer = isOrganizerByAuth || currentPlayer?.isOrganizer || false;

  const hasAnswered =
    currentPlayer && currentQuestion
      ? currentPlayer.answers[roomState!.currentQuestionIndex] !== undefined
      : false;

  // Calculate current rank
  const currentRank = leaderboard.find((entry) => entry.nickname === nickname)?.rank;

  // Calculate answer streak (consecutive correct answers ending at current/last question)
  const calculateStreak = (): number => {
    if (!currentPlayer || !roomState) return 0;

    const answers = currentPlayer.answers;
    let streak = 0;

    // Count backwards from current question to find consecutive correct answers
    for (let i = roomState.currentQuestionIndex; i >= 0; i--) {
      const answer = answers[i];
      if (answer?.isCorrect) {
        streak++;
      } else if (answer !== undefined) {
        // Found an incorrect answer, stop counting
        break;
      }
      // If answer is undefined, the question hasn't been answered yet, continue checking
    }

    return streak;
  };

  const currentStreak = calculateStreak();

  // Question intro screen
  useEffect(() => {
    if (!currentQuestion || !roomState) return;

    setShowQuestionIntro(true);
    setSelectedAnswer(null);
    setShortAnswerInput('');
    setShowResults(false);
    setGamePhase('QUESTION_INTRO');
    setIsSubmitting(false);
    playSound(SOUND_TYPES.QUESTION_START);

    const timer = setTimeout(() => {
      setShowQuestionIntro(false);
      setAnswerStartTime(Date.now());
      setGamePhase('ANSWERING');
    }, GAME_UI_TIMING.QUESTION_INTRO_MS);

    return () => clearTimeout(timer);
  }, [currentQuestion, roomState?.currentQuestionIndex, playSound]);

  // Handle answer submission phase
  useEffect(() => {
    if (hasAnswered && !questionEnded && !isOrganizer) {
      setGamePhase('SUBMITTED');
    }
  }, [hasAnswered, questionEnded, isOrganizer]);

  // Handle answer reveal phase -> leaderboard
  useEffect(() => {
    if (questionEnded) {
      setShowResults(true);
      setGamePhase('ANSWER_REVEAL');

      // Auto-transition to leaderboard after showing results
      const timer = setTimeout(() => {
        setGamePhase('LEADERBOARD');
      }, GAME_UI_TIMING.LEADERBOARD_TRANSITION_MS);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [questionEnded]);

  // Clean up localStorage, invalidate cache, and play victory sound when game finishes
  useEffect(() => {
    if (roomState?.status === 'finished') {
      localStorage.removeItem(STORAGE_KEYS.ROOM_NICKNAME(pin));
      localStorage.removeItem(STORAGE_KEYS.ROOM_PARTICIPANT_ID(pin));
      localStorage.removeItem(STORAGE_KEYS.ROOM_IS_ORGANIZER(pin));

      // Invalidate templates and games cache so playCount updates on browse page
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['games'] });

      if (!hasPlayedVictorySoundRef.current) {
        hasPlayedVictorySoundRef.current = true;
        playSound(SOUND_TYPES.VICTORY);
      }
    }
  }, [roomState?.status, pin, playSound, queryClient]);

  // Auto-redirect countdown when game finishes
  useEffect(() => {
    if (roomState?.status !== 'finished') return;

    const interval = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [roomState?.status]);

  // Redirect when countdown reaches 0
  useEffect(() => {
    if (roomState?.status === 'finished' && redirectCountdown === 0) {
      router.push(isOrganizer ? '/browse?tab=myGames' : '/');
    }
  }, [roomState?.status, redirectCountdown, isOrganizer, router]);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    joinRoom(nickname);
    setHasJoined(true);
  };

  const handleAnswerSelect = (answer: string) => {
    if (hasAnswered || isSubmitting || !answerStartTime) return;

    setIsSubmitting(true);
    playSound(SOUND_TYPES.ANSWER_SUBMIT);
    const responseTimeMs = Date.now() - answerStartTime;
    setSelectedAnswer(answer);
    submitAnswer(answer, responseTimeMs);
  };

  const handleShortAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasAnswered || isSubmitting || !answerStartTime || !shortAnswerInput.trim()) return;

    setIsSubmitting(true);
    playSound(SOUND_TYPES.ANSWER_SUBMIT);
    const responseTimeMs = Date.now() - answerStartTime;
    setSelectedAnswer(shortAnswerInput);
    submitAnswer(shortAnswerInput, responseTimeMs);
  };

  const handleEndQuestion = () => {
    endQuestion();
    setShowResults(true);
  };

  const handleNextQuestion = () => {
    // Request next question from server
    nextQuestion();
  };

  // Loading states
  if (authLoading && !storedNickname && !storedIsOrganizer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  if ((storedNickname || storedIsOrganizer) && !isConnected) {
    const getConnectionMessage = () => {
      switch (connectionStatus) {
        case 'reconnecting':
          return `연결이 끊겼습니다. 재연결 시도 중... (${reconnectAttempt}/5)`;
        case 'failed':
          return '연결에 실패했습니다.';
        case 'disconnected':
          return '연결이 끊겼습니다. 재연결 대기 중...';
        default:
          return '게임 연결 중...';
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <div className="text-center">
          {connectionStatus === 'failed' ? (
            <div className="w-16 h-16 bg-error-light rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-error text-3xl">!</span>
            </div>
          ) : (
            <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          )}
          <p className={`text-xl font-semibold ${connectionStatus === 'failed' ? 'text-error' : 'text-gray-700'}`}>
            {getConnectionMessage()}
          </p>
          {connectionStatus === 'failed' && (
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-all cursor-pointer"
            >
              다시 연결하기
            </button>
          )}
        </div>
      </div>
    );
  }

  // Nickname form (skip for organizer)
  if (!hasJoined && !storedIsOrganizer) {
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
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg transition-all hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
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

  // Waiting for game to start
  if (!roomState || roomState.status === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">게임 시작 대기 중...</p>
        </div>
      </div>
    );
  }

  // Game finished - Final results
  if (roomState.status === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 via-secondary-500 to-primary-700 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-white/10 to-transparent rounded-full blur-3xl" />
        </div>

        <Confetti isActive={true} duration={6000} particleCount={200} />
        <SoundToggle className="absolute top-4 right-4 text-white z-20" />

        <h1 className="text-5xl md:text-6xl font-bold text-white text-center mb-4 animate-slide-down relative z-10 drop-shadow-lg">
          🎉 게임 종료!
        </h1>

        <div className="w-full max-w-4xl relative z-10">
          <Podium entries={leaderboard} />

          {leaderboard.length > 3 && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 mt-6 border border-white/20">
              <div className="space-y-2">
                {leaderboard.slice(3, 10).map((entry) => (
                  <div
                    key={`final-${entry.rank}`}
                    className="flex items-center justify-between p-3 md:p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <span className="text-xl md:text-2xl font-bold text-white/80 w-10 text-center">
                        {entry.rank}위
                      </span>
                      <span className="font-semibold text-white truncate max-w-[120px] md:max-w-[200px]">
                        {entry.nickname}
                      </span>
                    </div>
                    <span className="text-lg md:text-xl font-bold text-white">{entry.score}점</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => router.push(isOrganizer ? '/browse?tab=myGames' : '/')}
            className="w-full mt-8 bg-white hover:bg-gray-50 text-primary-600 font-bold py-4 rounded-xl transition-all hover:scale-105 active:scale-100 cursor-pointer shadow-xl text-lg"
          >
            {isOrganizer ? '내 게임으로' : '홈으로'}{' '}
            <span className="text-primary-400 font-normal">({redirectCountdown}초)</span>
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
        </div>
      </div>
    );
  }

  const questionData = currentQuestion.data;
  const duration = questionData.duration || GAME_SETTINGS.DEFAULT_QUESTION_DURATION_SEC;
  const questionIndex = roomState.currentQuestionIndex;
  const totalQuestions = game?.questions.length || 0;

  // Question intro screen
  if (showQuestionIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-4 relative">
        <SoundToggle className="absolute top-4 right-4 text-white" />
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

  // Leaderboard screen (both organizer and participants)
  if (gamePhase === 'LEADERBOARD' && questionEnded) {
    return (
      <LeaderboardScreen
        leaderboard={leaderboard}
        questionIndex={questionIndex}
        totalQuestions={totalQuestions}
        isOrganizer={isOrganizer}
        onNextQuestion={isOrganizer ? handleNextQuestion : undefined}
      />
    );
  }

  // Render organizer or participant view
  if (isOrganizer) {
    return (
      <OrganizerView
        pin={pin}
        currentQuestion={currentQuestion}
        questionIndex={questionIndex}
        totalQuestions={totalQuestions}
        duration={duration}
        currentQuestionStartedAt={currentQuestionStartedAt || undefined}
        players={players}
        leaderboard={leaderboard}
        showResults={showResults}
        onEndQuestion={handleEndQuestion}
      />
    );
  }

  return (
    <ParticipantView
      currentQuestion={currentQuestion}
      questionIndex={questionIndex}
      totalQuestions={totalQuestions}
      duration={duration}
      currentQuestionStartedAt={currentQuestionStartedAt || undefined}
      selectedAnswer={selectedAnswer}
      shortAnswerInput={shortAnswerInput}
      hasAnswered={hasAnswered}
      questionEnded={questionEnded}
      lastAnswer={lastAnswer || undefined}
      currentScore={currentPlayer?.score || 0}
      currentRank={currentRank}
      phase={gamePhase}
      onAnswerSelect={handleAnswerSelect}
      onShortAnswerChange={setShortAnswerInput}
      onShortAnswerSubmit={handleShortAnswerSubmit}
      streak={currentStreak}
    />
  );
}
