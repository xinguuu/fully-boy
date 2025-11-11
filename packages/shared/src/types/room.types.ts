export enum RoomStatus {
  WAITING = 'WAITING',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED',
}

export interface Room {
  id: string;
  pin: string;
  gameId: string;
  organizerId: string;
  status: RoomStatus;
  createdAt: Date;
  startedAt: Date | null;
  endedAt: Date | null;
  expiresAt: Date;
}

export interface Participant {
  nickname: string;
  socketId: string;
  score: number;
  online: boolean;
}

export interface RoomState {
  roomId: string;
  pin: string;
  gameId: string;
  organizerId: string;
  status: RoomStatus;
  currentQuestionIndex: number;
  participants: Participant[];
  answers: Record<number, Record<string, { answer: string; timestamp: number }>>;
}

export interface LeaderboardEntry {
  nickname: string;
  score: number;
  rank: number;
  change?: number;
}
