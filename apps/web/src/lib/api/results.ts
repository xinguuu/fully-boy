import { resultApiClient } from './client';
import type { GameResult, GameResultsResponse } from '@/types/result.types';

export const resultsApi = {
  /**
   * Get all results for a specific game
   * @param gameId - Game ID
   * @param limit - Number of results to return (default: 10, max: 100)
   * @returns List of game results
   */
  async getGameResults(gameId: string, limit = 10): Promise<GameResultsResponse> {
    return resultApiClient.get<GameResultsResponse>(`/api/results/game/${gameId}?limit=${limit}`);
  },

  /**
   * Get result for a specific room
   * @param roomId - Room ID (same as result ID in this case)
   * @returns Game result
   */
  async getResultByRoom(roomId: string): Promise<GameResult> {
    return resultApiClient.get<GameResult>(`/api/results/room/${roomId}`);
  },

  /**
   * Create a new game result (called by backend, not typically used by frontend)
   * @param data - Result data
   * @returns Created result
   */
  async createResult(data: Partial<GameResult>): Promise<GameResult> {
    return resultApiClient.post<GameResult>('/api/results', data);
  },
};
