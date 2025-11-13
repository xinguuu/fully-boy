import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roomApi, type CreateRoomData, type JoinRoomData } from '../api';

export function useRoom(pin: string) {
  return useQuery({
    queryKey: ['room', pin],
    queryFn: () => roomApi.getByPin(pin),
    enabled: !!pin,
  });
}

export function useRoomParticipants(pin: string) {
  return useQuery({
    queryKey: ['room', pin, 'participants'],
    queryFn: () => roomApi.getParticipants(pin),
    enabled: !!pin,
    refetchInterval: 5000,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoomData) => roomApi.create(data),
    onSuccess: (room) => {
      queryClient.setQueryData(['room', room.pin], room);
    },
  });
}

export function useJoinRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pin, data }: { pin: string; data: JoinRoomData }) =>
      roomApi.join(pin, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['room', variables.pin, 'participants'] });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pin: string) => roomApi.delete(pin),
    onSuccess: (_, pin) => {
      queryClient.removeQueries({ queryKey: ['room', pin] });
    },
  });
}
