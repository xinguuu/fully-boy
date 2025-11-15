import { useEffect, useState, useCallback, useRef } from 'react';
import { WS_EVENTS } from '@xingu/shared';
import { wsClient } from '../websocket/client';
import type {
  RoomState,
  Game,
  Player,
  Question,
  LeaderboardEntry,
  QuestionResult,
  QuestionStatistics,
  AnswerReceivedResponse,
  ErrorResponse,
} from '../websocket/types';

interface UseGameSocketOptions {
  pin: string;
  nickname?: string;
  sessionId?: string;
  autoJoin?: boolean;
}

interface UseGameSocketReturn {
  isConnected: boolean;
  roomState: RoomState | null;
  game: Game | null;
  currentQuestion: Question | null;
  players: Player[];
  leaderboard: LeaderboardEntry[];
  lastAnswer: AnswerReceivedResponse | null;
  error: ErrorResponse | null;
  sessionRestored: boolean;
  joinRoom: (nickname: string) => void;
  startGame: () => void;
  nextQuestion: () => void;
  submitAnswer: (answer: unknown, responseTimeMs: number) => void;
  endQuestion: () => void;
  endGame: () => void;
}

export function useGameSocket({
  pin,
  nickname,
  sessionId,
  autoJoin = false,
}: UseGameSocketOptions): UseGameSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lastAnswer, setLastAnswer] = useState<AnswerReceivedResponse | null>(null);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [sessionRestored, setSessionRestored] = useState(false);

  const hasJoined = useRef(false);

  const players = roomState ? Object.values(roomState.players) : [];

  const joinRoom = useCallback(
    (joinNickname: string) => {
      if (hasJoined.current) return;
      wsClient.joinRoom(pin, joinNickname, sessionId);
      hasJoined.current = true;
    },
    [pin, sessionId]
  );

  const startGame = useCallback(() => {
    wsClient.startGame(pin);
  }, [pin]);

  const nextQuestion = useCallback(() => {
    wsClient.nextQuestion(pin);
  }, [pin]);

  const submitAnswer = useCallback(
    (answer: unknown, responseTimeMs: number) => {
      if (!roomState) return;
      wsClient.submitAnswer(pin, roomState.currentQuestionIndex, answer, responseTimeMs);
    },
    [pin, roomState]
  );

  const endQuestion = useCallback(() => {
    if (!roomState) return;
    wsClient.endQuestion(pin, roomState.currentQuestionIndex);
  }, [pin, roomState]);

  const endGame = useCallback(() => {
    wsClient.endGame(pin);
  }, [pin]);

  useEffect(() => {
    const socket = wsClient.connect(pin);

    const handleConnect = () => {
      setIsConnected(true);
      setError(null);

      if (autoJoin && nickname && !hasJoined.current) {
        joinRoom(nickname);
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleJoinedRoom = (data: { room: RoomState; game: Game }) => {
      setRoomState(data.room);
      setGame(data.game);
      setError(null);
    };

    const handleParticipantJoined = (data: { player: Player; playerCount: number }) => {
      setRoomState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          players: {
            ...prev.players,
            [data.player.id]: data.player,
          },
        };
      });
    };

    const handleParticipantLeft = (data: { playerId: string; playerCount: number }) => {
      setRoomState((prev) => {
        if (!prev) return null;
        const { [data.playerId]: removed, ...remainingPlayers } = prev.players;
        return {
          ...prev,
          players: remainingPlayers,
        };
      });
    };

    const handleGameStarted = (data: { room: RoomState }) => {
      setRoomState(data.room);
    };

    const handleQuestionStarted = (data: { questionIndex: number; question: Question }) => {
      setCurrentQuestion(data.question);
      setRoomState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentQuestionIndex: data.questionIndex,
        };
      });
      setLastAnswer(null);
    };

    const handleAnswerReceived = (data: AnswerReceivedResponse) => {
      setLastAnswer(data);
    };

    const handleAnswerSubmitted = (data: {
      playerId: string;
      playerNickname: string;
      questionIndex: number;
    }) => {
      console.log(`${data.playerNickname} submitted answer for Q${data.questionIndex + 1}`);
    };

    const handleQuestionEnded = (data: {
      questionIndex: number;
      correctAnswer: string;
      results: QuestionResult[];
      leaderboard: LeaderboardEntry[];
      statistics: QuestionStatistics;
    }) => {
      setLeaderboard(data.leaderboard);

      setRoomState((prev) => {
        if (!prev) return null;
        const updatedPlayers = { ...prev.players };

        data.results.forEach((result) => {
          if (updatedPlayers[result.playerId]) {
            updatedPlayers[result.playerId] = {
              ...updatedPlayers[result.playerId],
              score: result.currentScore,
            };
          }
        });

        return {
          ...prev,
          players: updatedPlayers,
        };
      });
    };

    const handleGameEnded = (data: {
      leaderboard: LeaderboardEntry[];
      room: RoomState;
    }) => {
      setLeaderboard(data.leaderboard);
      setRoomState(data.room);
      setCurrentQuestion(null);
    };

    const handleSessionRestored = (data: {
      sessionId: string;
      currentQuestionIndex: number;
      score: number;
      nickname: string;
      message: string;
    }) => {
      setSessionRestored(true);
      setRoomState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentQuestionIndex: data.currentQuestionIndex,
        };
      });
      console.log('[Session Restored]', data.message, `Score: ${data.score}, QuestionIndex: ${data.currentQuestionIndex}`);
    };

    const handleError = (data: ErrorResponse) => {
      setError(data);
      console.error('[WebSocket Error]', data.code, data.message);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on(WS_EVENTS.JOINED_ROOM, handleJoinedRoom);
    socket.on(WS_EVENTS.PARTICIPANT_JOINED, handleParticipantJoined);
    socket.on(WS_EVENTS.PARTICIPANT_LEFT, handleParticipantLeft);
    socket.on(WS_EVENTS.SESSION_RESTORED, handleSessionRestored);
    socket.on(WS_EVENTS.GAME_STARTED, handleGameStarted);
    socket.on(WS_EVENTS.QUESTION_STARTED, handleQuestionStarted);
    socket.on(WS_EVENTS.ANSWER_RECEIVED, handleAnswerReceived);
    socket.on(WS_EVENTS.ANSWER_SUBMITTED, handleAnswerSubmitted);
    socket.on(WS_EVENTS.QUESTION_ENDED, handleQuestionEnded);
    socket.on(WS_EVENTS.GAME_ENDED, handleGameEnded);
    socket.on(WS_EVENTS.ERROR, handleError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off(WS_EVENTS.JOINED_ROOM, handleJoinedRoom);
      socket.off(WS_EVENTS.PARTICIPANT_JOINED, handleParticipantJoined);
      socket.off(WS_EVENTS.PARTICIPANT_LEFT, handleParticipantLeft);
      socket.off(WS_EVENTS.SESSION_RESTORED, handleSessionRestored);
      socket.off(WS_EVENTS.GAME_STARTED, handleGameStarted);
      socket.off(WS_EVENTS.QUESTION_STARTED, handleQuestionStarted);
      socket.off(WS_EVENTS.ANSWER_RECEIVED, handleAnswerReceived);
      socket.off(WS_EVENTS.ANSWER_SUBMITTED, handleAnswerSubmitted);
      socket.off(WS_EVENTS.QUESTION_ENDED, handleQuestionEnded);
      socket.off(WS_EVENTS.GAME_ENDED, handleGameEnded);
      socket.off(WS_EVENTS.ERROR, handleError);

      wsClient.disconnect();
      hasJoined.current = false;
    };
  }, [pin, nickname, sessionId, autoJoin, joinRoom]);

  return {
    isConnected,
    roomState,
    game,
    currentQuestion,
    players,
    leaderboard,
    lastAnswer,
    error,
    sessionRestored,
    joinRoom,
    startGame,
    nextQuestion,
    submitAnswer,
    endQuestion,
    endGame,
  };
}
