import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gamesApi, type CreateGameRequest, type UpdateGameRequest } from '../api/games';

interface UseGamesOptions {
  enabled?: boolean;
}

export function useGames(options?: UseGamesOptions) {
  return useQuery({
    queryKey: ['games'],
    queryFn: gamesApi.getMyGames,
    staleTime: 1 * 60 * 1000, // 1 minute - my games change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    ...options,
  });
}

export function useGame(id: string) {
  return useQuery({
    queryKey: ['game', id],
    queryFn: () => gamesApi.getGame(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute - game details can change during editing
    gcTime: 5 * 60 * 1000, // 5 minutes
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

export function useFavoriteIds() {
  return useQuery({
    queryKey: ['favoriteIds'],
    queryFn: gamesApi.getFavoriteIds,
    staleTime: 2 * 60 * 1000, // 2 minutes - favorites don't change very often
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameId: string) => gamesApi.addFavorite(gameId),
    onMutate: async (gameId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['templates'] });
      await queryClient.cancelQueries({ queryKey: ['games'] });

      // Snapshot previous values
      const previousTemplates = queryClient.getQueryData(['templates']);
      const previousGames = queryClient.getQueryData(['games']);

      // Optimistically update templates
      queryClient.setQueryData(['templates'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          templates: old.templates.map((game: any) =>
            game.id === gameId ? { ...game, isFavorite: true } : game
          ),
        };
      });

      // Optimistically update games
      queryClient.setQueryData(['games'], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((game: any) =>
          game.id === gameId ? { ...game, isFavorite: true } : game
        );
      });

      return { previousTemplates, previousGames };
    },
    onError: (_err, _gameId, context) => {
      // Rollback on error
      if (context?.previousTemplates) {
        queryClient.setQueryData(['templates'], context.previousTemplates);
      }
      if (context?.previousGames) {
        queryClient.setQueryData(['games'], context.previousGames);
      }
    },
    onSettled: () => {
      // Refetch to ensure data is correct
      queryClient.invalidateQueries({ queryKey: ['favoriteIds'] });
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameId: string) => gamesApi.removeFavorite(gameId),
    onMutate: async (gameId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['templates'] });
      await queryClient.cancelQueries({ queryKey: ['games'] });

      // Snapshot previous values
      const previousTemplates = queryClient.getQueryData(['templates']);
      const previousGames = queryClient.getQueryData(['games']);

      // Optimistically update templates
      queryClient.setQueryData(['templates'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          templates: old.templates.map((game: any) =>
            game.id === gameId ? { ...game, isFavorite: false } : game
          ),
        };
      });

      // Optimistically update games
      queryClient.setQueryData(['games'], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((game: any) =>
          game.id === gameId ? { ...game, isFavorite: false } : game
        );
      });

      return { previousTemplates, previousGames };
    },
    onError: (_err, _gameId, context) => {
      // Rollback on error
      if (context?.previousTemplates) {
        queryClient.setQueryData(['templates'], context.previousTemplates);
      }
      if (context?.previousGames) {
        queryClient.setQueryData(['games'], context.previousGames);
      }
    },
    onSettled: () => {
      // Refetch to ensure data is correct
      queryClient.invalidateQueries({ queryKey: ['favoriteIds'] });
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}
