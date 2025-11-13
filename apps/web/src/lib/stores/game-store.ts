import { create } from 'zustand';
import type { Question } from '@xingu/shared';

interface PlayerAnswer {
  questionIndex: number;
  answer: string;
  isCorrect: boolean;
  points: number;
  responseTimeMs: number;
}

interface LeaderboardEntry {
  rank: number;
  playerId: string;
  nickname: string;
  score: number;
}

interface GameState {
  roomPin: string | null;
  participantId: string | null;
  nickname: string | null;
  currentQuestionIndex: number;
  currentQuestion: Question | null;
  answers: PlayerAnswer[];
  score: number;
  leaderboard: LeaderboardEntry[];
  gameStatus: 'waiting' | 'playing' | 'question' | 'results' | 'ended';

  setRoomPin: (pin: string) => void;
  setParticipant: (id: string, nickname: string) => void;
  setCurrentQuestion: (index: number, question: Question) => void;
  addAnswer: (answer: PlayerAnswer) => void;
  updateScore: (points: number) => void;
  setLeaderboard: (leaderboard: LeaderboardEntry[]) => void;
  setGameStatus: (status: GameState['gameStatus']) => void;
  reset: () => void;
}

const initialState = {
  roomPin: null,
  participantId: null,
  nickname: null,
  currentQuestionIndex: 0,
  currentQuestion: null,
  answers: [],
  score: 0,
  leaderboard: [],
  gameStatus: 'waiting' as const,
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  setRoomPin: (pin) => set({ roomPin: pin }),

  setParticipant: (id, nickname) => set({ participantId: id, nickname }),

  setCurrentQuestion: (index, question) =>
    set({ currentQuestionIndex: index, currentQuestion: question }),

  addAnswer: (answer) =>
    set((state) => ({ answers: [...state.answers, answer] })),

  updateScore: (points) =>
    set((state) => ({ score: state.score + points })),

  setLeaderboard: (leaderboard) => set({ leaderboard }),

  setGameStatus: (status) => set({ gameStatus: status }),

  reset: () => set(initialState),
}));
