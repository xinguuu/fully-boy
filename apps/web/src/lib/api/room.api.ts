import type { Room } from '@xingu/shared';
import { roomClient } from './client';

export interface CreateRoomData {
  gameId: string;
}

export interface JoinRoomData {
  nickname: string;
}

export interface Participant {
  id: string;
  nickname: string;
  joinedAt: string;
}

export const roomApi = {
  create: async (data: CreateRoomData): Promise<Room> => {
    return roomClient.post<Room>('/', data);
  },

  getByPin: async (pin: string): Promise<Room> => {
    return roomClient.get<Room>(`/${pin}`);
  },

  join: async (pin: string, data: JoinRoomData): Promise<{ participantId: string }> => {
    return roomClient.post<{ participantId: string }>(`/${pin}/join`, data);
  },

  getParticipants: async (pin: string): Promise<Participant[]> => {
    return roomClient.get<Participant[]>(`/${pin}/participants`);
  },

  delete: async (pin: string): Promise<void> => {
    return roomClient.delete<void>(`/${pin}`);
  },
};
