export interface CreateResultDto {
  roomId: string;
  participantCount: number;
  duration: number;
  averageScore: number;
  leaderboard: LeaderboardEntry[];
  questionStats: QuestionStat[];
}

export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  score: number;
  correctAnswers: number;
  averageResponseTime: number;
}

export interface QuestionStat {
  questionId: string;
  questionNumber: number;
  correctRate: number;
  averageResponseTime: number;
  answerDistribution: Record<string, number>;
}

export interface ResultResponse {
  id: string;
  roomId: string;
  participantCount: number;
  duration: number;
  averageScore: number;
  leaderboard: LeaderboardEntry[];
  questionStats: QuestionStat[];
  createdAt: Date;
}
