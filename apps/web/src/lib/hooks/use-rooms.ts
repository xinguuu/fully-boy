import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi, type CreateRoomRequest } from '../api/rooms';

/**
 * DEPRECATED: Room state is now managed via WebSocket (useGameSocket hook)
 * Kept for reference only
 */
// export function useRoom(pin: string) {
//   return useQuery({
//     queryKey: ['room', pin],
//     queryFn: () => roomsApi.getRoomByPIN(pin),
//     enabled: !!pin && pin.length === 6,
//   });
// }

/**
 * DEPRECATED: Participants are now managed via WebSocket real-time updates
 * Replaced by: useGameSocket hook (players state)
 */
// export function useParticipants(pin: string) {
//   return useQuery({
//     queryKey: ['room', pin, 'participants'],
//     queryFn: () => roomsApi.getParticipants(pin),
//     enabled: !!pin && pin.length === 6,
//     refetchInterval: 3000,
//   });
// }

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoomRequest) => roomsApi.createRoom(data),
    onSuccess: (room) => {
      queryClient.setQueryData(['room', room.pin], room);
    },
  });
}

/**
 * DEPRECATED: Participants now join via WebSocket only
 * Replaced by: useGameSocket hook with autoJoin option
 */
// export function useJoinRoom(pin: string) {
//   const queryClient = useQueryClient();
//
//   return useMutation({
//     mutationFn: (data: JoinRoomRequest) => roomsApi.joinRoom(pin, data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['room', pin, 'participants'] });
//       queryClient.invalidateQueries({ queryKey: ['room', pin] });
//     },
//   });
// }

/**
 * DEPRECATED: Session validation now handled via WebSocket
 * Replaced by: participantId-based session restoration in useGameSocket
 */
// export function useValidateSession(sessionId: string) {
//   return useQuery({
//     queryKey: ['session', sessionId],
//     queryFn: () => roomsApi.validateSession(sessionId),
//     enabled: !!sessionId,
//     staleTime: 0,
//     retry: false,
//   });
// }

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
