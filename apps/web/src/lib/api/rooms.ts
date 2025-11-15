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

export interface JoinRoomRequest {
  nickname: string;
  deviceId: string;
}

export interface Participant {
  id: string;
  nickname: string;
  deviceId: string;
  joinedAt: Date;
}

export interface ParticipantSession {
  sessionId: string;
  roomPin: string;
  nickname: string;
  deviceId: string;
  joinedAt: string;
  currentQuestionIndex: number;
  score: number;
}

export interface JoinRoomResponse {
  sessionId: string;
  nickname: string;
  deviceId: string;
  participant: Participant;
}

export interface ValidateSessionResponse {
  isValid: boolean;
  session: ParticipantSession | null;
}

export const roomsApi = {
  createRoom: async (data: CreateRoomRequest): Promise<RoomResponse> => {
    return apiClient.post<RoomResponse>('/api/rooms', data);
  },

  getRoomByPIN: async (pin: string): Promise<RoomResponse> => {
    return apiClient.get<RoomResponse>(`/api/rooms/${pin}`);
  },

  joinRoom: async (pin: string, data: JoinRoomRequest): Promise<JoinRoomResponse> => {
    return apiClient.post<JoinRoomResponse>(`/api/rooms/${pin}/join`, data);
  },

  getParticipants: async (pin: string): Promise<Participant[]> => {
    return apiClient.get<Participant[]>(`/api/rooms/${pin}/participants`);
  },

  validateSession: async (sessionId: string): Promise<ValidateSessionResponse> => {
    return apiClient.get<ValidateSessionResponse>(`/api/rooms/session/${sessionId}`);
  },

  deleteRoom: async (pin: string): Promise<void> => {
    return apiClient.delete<void>(`/api/rooms/${pin}`);
  },
};
