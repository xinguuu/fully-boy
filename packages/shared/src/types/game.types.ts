export enum GameType {
  OX_QUIZ = 'OX_QUIZ',
  BALANCE_GAME = 'BALANCE_GAME',
  INITIAL_QUIZ = 'INITIAL_QUIZ',
  FOUR_CHOICE_QUIZ = 'FOUR_CHOICE_QUIZ',
  SPEED_QUIZ = 'SPEED_QUIZ',
}

export enum Category {
  ICE_BREAKING = 'ICE_BREAKING',
  QUIZ = 'QUIZ',
  MUSIC = 'MUSIC',
  VOTE = 'VOTE',
  ENTERTAINMENT = 'ENTERTAINMENT',
  MEME = 'MEME',
}

export interface Game {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  gameType: GameType;
  category: Category;
  isPublic: boolean;
  duration: number;
  minPlayers: number;
  maxPlayers: number;
  needsMobile: boolean;
  playCount: number;
  favoriteCount: number;
  settings: Record<string, unknown>;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  gameId: string;
  order: number;
  content: string;
  data: Record<string, unknown>;
  imageUrl: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
