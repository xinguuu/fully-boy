import { useQuery } from '@tanstack/react-query';
import { resultsApi } from '../api/results';

interface UseGameResultsOptions {
  enabled?: boolean;
  limit?: number;
}

/**
 * Fetch all results for a specific game
 * @param gameId - Game ID
 * @param options - Query options
 */
export function useGameResults(gameId: string, options?: UseGameResultsOptions) {
  const { enabled = true, limit = 10 } = options || {};

  return useQuery({
    queryKey: ['gameResults', gameId, limit],
    queryFn: () => resultsApi.getGameResults(gameId, limit),
    enabled: enabled && !!gameId,
  });
}

/**
 * Fetch result for a specific room
 * @param roomId - Room ID
 * @param options - Query options
 */
export function useResultByRoom(roomId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['result', roomId],
    queryFn: () => resultsApi.getResultByRoom(roomId),
    enabled: options?.enabled !== false && !!roomId,
  });
}
