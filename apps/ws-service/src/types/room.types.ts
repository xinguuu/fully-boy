export interface Player {
  id: string;
  nickname: string;
  socketId: string;
  score: number;
  answers: Record<string, unknown>;
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
  currentQuestionStartedAt?: Date;
  startedAt?: Date;
  endedAt?: Date;
}

export interface Question {
  id: string;
  order: number;
  content: string;
  data: Record<string, unknown>;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
}

export interface GameData {
  id: string;
  title: string;
  gameType: string;
  duration: number;
  needsMobile: boolean;
  settings: Record<string, unknown>;
  questions: Question[];
}
