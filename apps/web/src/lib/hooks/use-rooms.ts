import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roomsApi, type CreateRoomRequest, type JoinRoomRequest } from '../api/rooms';

export function useRoom(pin: string) {
  return useQuery({
    queryKey: ['room', pin],
    queryFn: () => roomsApi.getRoomByPIN(pin),
    enabled: !!pin && pin.length === 6,
  });
}

export function useParticipants(pin: string) {
  return useQuery({
    queryKey: ['room', pin, 'participants'],
    queryFn: () => roomsApi.getParticipants(pin),
    enabled: !!pin && pin.length === 6,
    refetchInterval: 3000,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoomRequest) => roomsApi.createRoom(data),
    onSuccess: (room) => {
      queryClient.setQueryData(['room', room.pin], room);
    },
  });
}

export function useJoinRoom(pin: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JoinRoomRequest) => roomsApi.joinRoom(pin, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room', pin, 'participants'] });
      queryClient.invalidateQueries({ queryKey: ['room', pin] });
    },
  });
}

export function useValidateSession(sessionId: string) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => roomsApi.validateSession(sessionId),
    enabled: !!sessionId,
    staleTime: 0,
    retry: false,
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pin: string) => roomsApi.deleteRoom(pin),
    onSuccess: (_, pin) => {
      queryClient.removeQueries({ queryKey: ['room', pin] });
      queryClient.removeQueries({ queryKey: ['room', pin, 'participants'] });
    },
  });
}
