import { resultClient } from './client';

export interface SubmitResultData {
  roomId: string;
  gameId: string;
  participantId: string;
  answers: {
    questionIndex: number;
    answer: string;
    isCorrect: boolean;
    points: number;
    responseTimeMs: number;
  }[];
  totalScore: number;
  completedAt: string;
}

export interface ResultStats {
  totalParticipants: number;
  averageScore: number;
  completionRate: number;
  questionStats: {
    questionIndex: number;
    correctRate: number;
    averageResponseTime: number;
  }[];
}

export interface LeaderboardEntry {
  rank: number;
  participantId: string;
  nickname: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: string;
}

export const resultApi = {
  submit: async (data: SubmitResultData): Promise<{ id: string }> => {
    return resultClient.post<{ id: string }>('/', data);
  },

  getByRoom: async (roomId: string): Promise<LeaderboardEntry[]> => {
    return resultClient.get<LeaderboardEntry[]>(`/room/${roomId}`);
  },

  getByGame: async (gameId: string): Promise<ResultStats> => {
    return resultClient.get<ResultStats>(`/game/${gameId}`);
  },
};
