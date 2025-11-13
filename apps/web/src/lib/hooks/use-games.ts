import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gamesApi, type CreateGameRequest, type UpdateGameRequest } from '../api/games';

export function useGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: gamesApi.getMyGames,
  });
}

export function useGame(id: string) {
  return useQuery({
    queryKey: ['game', id],
    queryFn: () => gamesApi.getGame(id),
    enabled: !!id,
  });
}

export function useCreateGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGameRequest) => gamesApi.createGame(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

export function useUpdateGame(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateGameRequest) => gamesApi.updateGame(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['game', id] });
    },
  });
}

export function useDeleteGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => gamesApi.deleteGame(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}
