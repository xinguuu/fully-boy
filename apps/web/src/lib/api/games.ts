import { gameApiClient } from './client';
import type { Game, GameType, Category } from '@xingu/shared';

export interface CreateGameRequest {
  title: string;
  description?: string;
  thumbnail?: string;
  gameType: GameType;
  category: Category;
  isPublic?: boolean;
  duration: number;
  minPlayers?: number;
  maxPlayers?: number;
  needsMobile: boolean;
  settings: Record<string, unknown>;
  questions: Array<{
    order: number;
    content: string;
    data: Record<string, unknown>;
    imageUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
  }>;
  sourceGameId?: string;
}

export interface UpdateGameRequest {
  title?: string;
  description?: string;
  thumbnail?: string;
  category?: Category;
  isPublic?: boolean;
  duration?: number;
  minPlayers?: number;
  maxPlayers?: number;
  needsMobile?: boolean;
  settings?: Record<string, unknown>;
  questions?: Array<{
    id?: string;
    order: number;
    content: string;
    data: Record<string, unknown>;
    imageUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
  }>;
}

export const gamesApi = {
  getMyGames: async (): Promise<Game[]> => {
    return gameApiClient.get<Game[]>('/api/games/my-games');
  },

  getGame: async (id: string): Promise<Game> => {
    return gameApiClient.get<Game>(`/api/games/${id}`);
  },

  createGame: async (data: CreateGameRequest): Promise<Game> => {
    return gameApiClient.post<Game>('/api/games', data);
  },

  updateGame: async (id: string, data: UpdateGameRequest): Promise<Game> => {
    return gameApiClient.put<Game>(`/api/games/${id}`, data);
  },

  deleteGame: async (id: string): Promise<void> => {
    return gameApiClient.delete<void>(`/api/games/${id}`);
  },

  getFavorites: async (): Promise<Game[]> => {
    return gameApiClient.get<Game[]>('/api/games/favorites');
  },

  getFavoriteIds: async (): Promise<string[]> => {
    return gameApiClient.get<string[]>('/api/games/favorites/ids');
  },

  addFavorite: async (gameId: string): Promise<void> => {
    return gameApiClient.post<void>(`/api/games/${gameId}/favorite`, {});
  },

  removeFavorite: async (gameId: string): Promise<void> => {
    return gameApiClient.delete<void>(`/api/games/${gameId}/favorite`);
  },
};
