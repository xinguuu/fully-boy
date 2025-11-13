import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gameApi, type CreateGameData, type UpdateGameData } from '../api';

export function useGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: gameApi.list,
  });
}

export function useGame(id: string) {
  return useQuery({
    queryKey: ['game', id],
    queryFn: () => gameApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGameData) => gameApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

export function useUpdateGame(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateGameData) => gameApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['game', id] });
    },
  });
}

export function useDeleteGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => gameApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}
