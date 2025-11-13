import { useMutation, useQuery } from '@tanstack/react-query';
import { resultApi, type SubmitResultData } from '../api';

export function useRoomResults(roomId: string) {
  return useQuery({
    queryKey: ['results', 'room', roomId],
    queryFn: () => resultApi.getByRoom(roomId),
    enabled: !!roomId,
  });
}

export function useGameStats(gameId: string) {
  return useQuery({
    queryKey: ['results', 'game', gameId],
    queryFn: () => resultApi.getByGame(gameId),
    enabled: !!gameId,
  });
}

export function useSubmitResult() {
  return useMutation({
    mutationFn: (data: SubmitResultData) => resultApi.submit(data),
  });
}
