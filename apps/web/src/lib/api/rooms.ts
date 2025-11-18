import { apiClient } from './client';

export interface CreateRoomRequest {
  gameId: string;
  expiresInMinutes?: number;
}

export interface RoomResponse {
  id: string;
  pin: string;
  gameId: string;
  organizerId: string;
  status: string;
  createdAt: Date;
  expiresAt: Date;
  participantCount: number;
}

/**
 * DEPRECATED TYPES - Kept for reference
 * These were used by the old REST API join flow
 */
// export interface JoinRoomRequest {
//   nickname: string;
//   deviceId: string;
// }

// export interface Participant {
//   id: string;
//   nickname: string;
//   deviceId: string;
//   joinedAt: Date;
// }

// export interface ParticipantSession {
//   sessionId: string;
//   roomPin: string;
//   nickname: string;
//   deviceId: string;
//   joinedAt: string;
//   currentQuestionIndex: number;
//   score: number;
// }

// export interface JoinRoomResponse {
//   sessionId: string;
//   nickname: string;
//   deviceId: string;
//   participant: Participant;
// }

// export interface ValidateSessionResponse {
//   isValid: boolean;
//   session: ParticipantSession | null;
// }

export const roomsApi = {
  createRoom: async (data: CreateRoomRequest): Promise<RoomResponse> => {
    return apiClient.post<RoomResponse>('/api/rooms', data);
  },

  /**
   * DEPRECATED: Room state now managed via WebSocket
   * Kept for potential admin/debugging purposes
   */
  getRoomByPIN: async (pin: string): Promise<RoomResponse> => {
    return apiClient.get<RoomResponse>(`/api/rooms/${pin}`);
  },

  /**
   * DEPRECATED: Participants now join via WebSocket only
   * Replaced by: WS_EVENTS.JOIN_ROOM
   */
  // joinRoom: async (pin: string, data: JoinRoomRequest): Promise<JoinRoomResponse> => {
  //   return apiClient.post<JoinRoomResponse>(`/api/rooms/${pin}/join`, data);
  // },

  /**
   * DEPRECATED: Participants fetched via WebSocket real-time updates
   * Replaced by: useGameSocket hook (players state)
   */
  // getParticipants: async (pin: string): Promise<Participant[]> => {
  //   return apiClient.get<Participant[]>(`/api/rooms/${pin}/participants`);
  // },

  /**
   * DEPRECATED: Session validation via WebSocket participantId
   * Replaced by: participantId-based session restoration
   */
  // validateSession: async (sessionId: string): Promise<ValidateSessionResponse> => {
  //   return apiClient.get<ValidateSessionResponse>(`/api/rooms/session/${sessionId}`);
  // },

  deleteRoom: async (pin: string): Promise<void> => {
    return apiClient.delete<void>(`/api/rooms/${pin}`);
  },
};
