import { z } from 'zod';

export const CreateRoomDtoSchema = z.object({
  gameId: z.string().cuid('Invalid game ID format'),
});

export type CreateRoomDto = z.infer<typeof CreateRoomDtoSchema>;

export interface RoomResponse {
  id: string;
  pin: string;
  gameId: string;
  status: string;
  createdAt: Date;
  expiresAt: Date;
  game: {
    id: string;
    title: string;
    gameType: string;
    duration: number;
    needsMobile: boolean;
  };
}
