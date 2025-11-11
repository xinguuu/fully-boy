import { prisma } from '../config/database';
import { CreateRoomDto } from '../dto/room.dto';

function generateRoomPin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export class RoomService {
  async createRoom(userId: string, dto: CreateRoomDto) {
    const game = await prisma.game.findUnique({
      where: { id: dto.gameId },
    });

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.userId !== userId && !game.isPublic) {
      throw new Error('Cannot create room for private game');
    }

    let pin = generateRoomPin();
    let existingRoom = await prisma.room.findUnique({
      where: { pin },
    });

    while (existingRoom) {
      pin = generateRoomPin();
      existingRoom = await prisma.room.findUnique({
        where: { pin },
      });
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 3);

    return prisma.room.create({
      data: {
        pin,
        gameId: dto.gameId,
        organizerId: userId,
        expiresAt,
      },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            gameType: true,
            duration: true,
            needsMobile: true,
          },
        },
      },
    });
  }

  async getRoomByPin(pin: string) {
    const room = await prisma.room.findUnique({
      where: { pin },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            gameType: true,
            duration: true,
            needsMobile: true,
            settings: true,
            questions: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!room) {
      throw new Error('Room not found');
    }

    if (new Date() > room.expiresAt) {
      throw new Error('Room has expired');
    }

    return room;
  }
}

export const roomService = new RoomService();
