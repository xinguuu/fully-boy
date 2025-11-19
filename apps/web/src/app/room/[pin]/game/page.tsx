'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGameSocket, useAuth } from '@/lib/hooks';
import { ParticipantView } from '@/components/game/ParticipantView';
import { OrganizerView } from '@/components/game/OrganizerView';
import type { GamePhase } from '@/types/game.types';

export default function LiveGamePage() {
  const params = useParams();
  const router = useRouter();
  const pin = params.pin as string;
  const { user, isLoading: authLoading } = useAuth();

  const storedNickname =
    typeof window !== 'undefined' ? localStorage.getItem(`room_${pin}_nickname`) : null;
  const storedParticipantId =
    typeof window !== 'undefined' ? localStorage.getItem(`room_${pin}_participantId`) : null;

  const isOrganizerByAuth = !!user && !storedNickname;

  const [nickname, setNickname] = useState(storedNickname || '');
  const [hasJoined, setHasJoined] = useState(!!storedNickname || isOrganizerByAuth);
  const [answerStartTime, setAnswerStartTime] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shortAnswerInput, setShortAnswerInput] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showQuestionIntro, setShowQuestionIntro] = useState(false);
  const [gamePhase, setGamePhase] = useState<GamePhase>('ANSWERING');

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

  // Question intro screen
  useEffect(() => {
    if (!currentQuestion) return;

    setShowQuestionIntro(true);
    setSelectedAnswer(null);
    setShortAnswerInput('');
    setShowResults(false);
    setGamePhase('QUESTION_INTRO');

    const timer = setTimeout(() => {
      setShowQuestionIntro(false);
      setAnswerStartTime(Date.now());
      setGamePhase('ANSWERING');
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentQuestion]);

  // Handle answer submission phase
  useEffect(() => {
    if (hasAnswered && !questionEnded && !isOrganizer) {
      setGamePhase('SUBMITTED');
    }
  }, [hasAnswered, questionEnded, isOrganizer]);

  // Handle answer reveal phase
  useEffect(() => {
    if (questionEnded) {
      setShowResults(true);
      if (!isOrganizer) {
        setGamePhase('ANSWER_REVEAL');
        // After 3 seconds, show leaderboard
        const timer = setTimeout(() => {
          setGamePhase('LEADERBOARD');
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
    return undefined;
  }, [questionEnded, isOrganizer]);

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

  const handleShortAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasAnswered || !answerStartTime || !shortAnswerInput.trim()) return;

    const responseTimeMs = Date.now() - answerStartTime;
    setSelectedAnswer(shortAnswerInput);
    submitAnswer(shortAnswerInput, responseTimeMs);
  };

  const handleEndQuestion = () => {
    endQuestion();
    setShowResults(true);
  };

  // Loading states
  if (authLoading && !storedNickname) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  if (storedNickname && !isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">게임 연결 중...</p>
        </div>
      </div>
    );
  }

  // Nickname form
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
        </div>
      </div>
    );
  }

  const questionData = currentQuestion.data;
  const duration = questionData.duration || 30;
  const questionIndex = roomState.currentQuestionIndex;
  const totalQuestions = game?.questions.length || 0;

  // Question intro screen
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
    />
  );
}
