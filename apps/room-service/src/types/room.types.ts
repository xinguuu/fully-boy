export interface CreateRoomDto {
  gameId: string;
  organizerId: string;
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

export interface JoinRoomDto {
  nickname: string;
  deviceId: string;
}

export interface Participant {
  id: string;
  nickname: string;
  deviceId: string;
  joinedAt: Date;
}
