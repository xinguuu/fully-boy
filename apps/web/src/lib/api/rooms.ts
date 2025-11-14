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

export const roomsApi = {
  createRoom: async (data: CreateRoomRequest): Promise<RoomResponse> => {
    return apiClient.post<RoomResponse>('/api/rooms', data);
  },

  getRoomByPIN: async (pin: string): Promise<RoomResponse> => {
    return apiClient.get<RoomResponse>(`/api/rooms/${pin}`);
  },

  joinRoom: async (pin: string, data: JoinRoomRequest): Promise<Participant> => {
    return apiClient.post<Participant>(`/api/rooms/${pin}/join`, data);
  },

  getParticipants: async (pin: string): Promise<Participant[]> => {
    return apiClient.get<Participant[]>(`/api/rooms/${pin}/participants`);
  },

  deleteRoom: async (pin: string): Promise<void> => {
    return apiClient.delete<void>(`/api/rooms/${pin}`);
  },
};
