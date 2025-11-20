import { useEffect, useState, useCallback, useRef } from 'react';
import { WS_EVENTS } from '@xingu/shared';
import { wsClient } from '../websocket/client';
import { STORAGE_KEYS } from '../constants/storage';
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
  participantId?: string;
  autoJoin?: boolean;
}

interface UseGameSocketReturn {
  isConnected: boolean;
  roomState: RoomState | null;
  game: Game | null;
  currentQuestion: Question | null;
  currentQuestionStartedAt: Date | string | null;
  players: Player[];
  leaderboard: LeaderboardEntry[];
  lastAnswer: AnswerReceivedResponse | null;
  questionEnded: boolean;
  error: ErrorResponse | null;
  sessionRestored: boolean;
  participantId: string | null;
  role: 'organizer' | 'participant' | null;
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
  participantId: initialParticipantId,
  autoJoin = false,
}: UseGameSocketOptions): UseGameSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentQuestionStartedAt, setCurrentQuestionStartedAt] = useState<Date | string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lastAnswer, setLastAnswer] = useState<AnswerReceivedResponse | null>(null);
  const [questionEnded, setQuestionEnded] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [sessionRestored, setSessionRestored] = useState(false);
  const [participantId, setParticipantId] = useState<string | null>(initialParticipantId || null);
  const [role, setRole] = useState<'organizer' | 'participant' | null>(null);

  const hasJoined = useRef(false);

  const players = roomState ? Object.values(roomState.players) : [];

  const joinRoom = useCallback(
    (joinNickname: string) => {
      if (hasJoined.current) return;
      wsClient.joinRoom(pin, joinNickname, participantId || undefined);
      hasJoined.current = true;
    },
    [pin, participantId]
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

      // Auto-join for both organizer (no nickname) and participant (with nickname)
      if (autoJoin && !hasJoined.current) {
        wsClient.joinRoom(pin, nickname || undefined, participantId || undefined);
        hasJoined.current = true;
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleJoinedRoom = (data: {
      role: 'organizer' | 'participant';
      participantId?: string;
      room: RoomState;
      game: Game;
      sessionRestored?: boolean;
    }) => {
      setRoomState(data.room);
      setGame(data.game);
      setRole(data.role);
      setError(null);

      // Save organizer flag to localStorage for reconnection
      if (data.role === 'organizer') {
        localStorage.setItem(STORAGE_KEYS.ROOM_IS_ORGANIZER(pin), 'true');
      }

      // Save participantId to state and localStorage for participants
      if (data.role === 'participant' && data.participantId) {
        setParticipantId(data.participantId);
        localStorage.setItem(STORAGE_KEYS.ROOM_PARTICIPANT_ID(pin), data.participantId);

        if (data.sessionRestored) {
          setSessionRestored(true);
        }
      }

      console.log(`[JOINED_ROOM] Role: ${data.role}${data.participantId ? `, ParticipantID: ${data.participantId}` : ''}`);
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
      console.log('[GAME_STARTED]', data.room.status, 'questionIndex:', data.room.currentQuestionIndex);
      setRoomState(data.room);
    };

    const handleQuestionStarted = (data: { questionIndex: number; question: Question; startedAt?: Date | string }) => {
      console.log('[QUESTION_STARTED]', 'questionIndex:', data.questionIndex, 'question:', data.question?.content, 'startedAt:', data.startedAt);
      setCurrentQuestion(data.question);
      setCurrentQuestionStartedAt(data.startedAt || null);
      setRoomState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentQuestionIndex: data.questionIndex,
          currentQuestionStartedAt: data.startedAt,
        };
      });
      setLastAnswer(null);
      setQuestionEnded(false);
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
      setQuestionEnded(true);
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

    const handleStateSynced = (data: { room: RoomState }) => {
      setRoomState(data.room);
    };

    const handleSessionRestored = (data: {
      participantId: string;
      currentQuestionIndex: number;
      score: number;
      nickname: string;
      message: string;
    }) => {
      setSessionRestored(true);
      setParticipantId(data.participantId);
      localStorage.setItem(STORAGE_KEYS.ROOM_PARTICIPANT_ID(pin), data.participantId);

      setRoomState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentQuestionIndex: data.currentQuestionIndex,
        };
      });
      console.log('[Session Restored]', data.message, `ParticipantID: ${data.participantId}, Score: ${data.score}, QuestionIndex: ${data.currentQuestionIndex}`);
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
    socket.on(WS_EVENTS.STATE_SYNCED, handleStateSynced);
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
      socket.off(WS_EVENTS.STATE_SYNCED, handleStateSynced);
      socket.off(WS_EVENTS.ERROR, handleError);

      wsClient.disconnect();
      hasJoined.current = false;
    };
  }, [pin, nickname, participantId, autoJoin, joinRoom]);

  return {
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
    sessionRestored,
    participantId,
    role,
    joinRoom,
    startGame,
    nextQuestion,
    submitAnswer,
    endQuestion,
    endGame,
  };
}
