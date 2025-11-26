import type { WS_EVENTS, MediaSettings } from '@xingu/shared';

export type WsEvent = (typeof WS_EVENTS)[keyof typeof WS_EVENTS];

export interface Player {
  id: string;
  nickname: string;
  socketId: string;
  score: number;
  answers: Record<number, {
    answer: unknown;
    isCorrect: boolean;
    points: number;
    responseTimeMs: number;
    submittedAt: Date;
  }>;
  isOrganizer: boolean;
  joinedAt: Date;
}

export interface RoomState {
  roomId: string;
  pin: string;
  gameId: string;
  organizerId: string;
  status: 'waiting' | 'playing' | 'finished';
  players: Record<string, Player>;
  currentQuestionIndex: number;
  currentQuestionStartedAt?: Date | string;
  startedAt?: Date;
}

export interface Question {
  id: string;
  order: number;
  content: string;
  data: {
    type: 'multiple-choice' | 'true-false' | 'short-answer' | 'balance-game';
    correctAnswer?: string;
    options?: string[];
    duration?: number;
    imageUrl?: string;
    // Balance game specific
    optionA?: string;
    optionB?: string;
    scoringMode?: 'majority' | 'none';
  };
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  mediaSettings?: MediaSettings | null;
}

export interface Game {
  id: string;
  title: string;
  description: string | null;
  gameType: string;
  category: string;
  questions: Question[];
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  nickname: string;
  score: number;
}

export interface QuestionResult {
  playerId: string;
  nickname: string;
  answer: unknown;
  isCorrect: boolean;
  points: number;
  responseTimeMs?: number;
  currentScore: number;
}

export interface QuestionStatistics {
  totalAnswers: number;
  correctAnswers: number;
  averageResponseTime: number;
}

export interface JoinRoomPayload {
  pin: string;
  nickname?: string;
  participantId?: string;
}

export interface StartGamePayload {
  pin: string;
}

export interface NextQuestionPayload {
  pin: string;
}

export interface SubmitAnswerPayload {
  pin: string;
  questionIndex: number;
  answer: unknown;
  responseTimeMs: number;
}

export interface EndQuestionPayload {
  pin: string;
  questionIndex: number;
}

export interface EndGamePayload {
  pin: string;
}

export interface JoinedRoomResponse {
  room: RoomState;
  game: Game;
}

export interface ParticipantJoinedResponse {
  player: Player;
  playerCount: number;
}

export interface ParticipantLeftResponse {
  playerId: string;
  playerCount: number;
}

export interface GameStartedResponse {
  room: RoomState;
}

export interface QuestionStartedResponse {
  questionIndex: number;
  question: Question;
  startedAt?: Date | string;
}

export interface AnswerReceivedResponse {
  questionIndex: number;
  answer: unknown;
  isCorrect: boolean;
  points: number;
  breakdown?: {
    basePoints: number;
    speedBonus: number;
    totalPoints: number;
  };
}

export interface AnswerSubmittedResponse {
  playerId: string;
  playerNickname: string;
  questionIndex: number;
}

export interface QuestionEndedResponse {
  questionIndex: number;
  correctAnswer?: string; // Optional for balance game
  results: QuestionResult[];
  leaderboard: LeaderboardEntry[];
  statistics: QuestionStatistics;
}

export interface GameEndedResponse {
  leaderboard: LeaderboardEntry[];
  room: RoomState;
}

export interface ErrorResponse {
  code: string;
  message: string;
}

export type EventPayloads = {
  [WS_EVENTS.JOIN_ROOM]: JoinRoomPayload;
  [WS_EVENTS.START_GAME]: StartGamePayload;
  [WS_EVENTS.NEXT_QUESTION]: NextQuestionPayload;
  [WS_EVENTS.SUBMIT_ANSWER]: SubmitAnswerPayload;
  [WS_EVENTS.END_QUESTION]: EndQuestionPayload;
  [WS_EVENTS.END_GAME]: EndGamePayload;
};

export type EventResponses = {
  [WS_EVENTS.JOINED_ROOM]: JoinedRoomResponse;
  [WS_EVENTS.PARTICIPANT_JOINED]: ParticipantJoinedResponse;
  [WS_EVENTS.PARTICIPANT_LEFT]: ParticipantLeftResponse;
  [WS_EVENTS.GAME_STARTED]: GameStartedResponse;
  [WS_EVENTS.QUESTION_STARTED]: QuestionStartedResponse;
  [WS_EVENTS.ANSWER_RECEIVED]: AnswerReceivedResponse;
  [WS_EVENTS.ANSWER_SUBMITTED]: AnswerSubmittedResponse;
  [WS_EVENTS.QUESTION_ENDED]: QuestionEndedResponse;
  [WS_EVENTS.GAME_ENDED]: GameEndedResponse;
  [WS_EVENTS.ERROR]: ErrorResponse;
};
