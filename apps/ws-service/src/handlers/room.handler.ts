import { Server, Socket } from 'socket.io';
import { WS_EVENTS } from '@xingu/shared';
import { prisma } from '../config/database';
import { roomStateService } from '../services/room-state.service';
import { Player } from '../types/room.types';
import { AuthenticatedSocket } from '../middleware/ws-auth.middleware';

export function setupRoomHandlers(io: Server, socket: Socket) {
  socket.on(
    WS_EVENTS.JOIN_ROOM,
    async (data: { pin: string; nickname: string }) => {
      try {
        const authSocket = socket as AuthenticatedSocket;
        const { pin, nickname } = data;

        const room = await prisma.room.findUnique({
          where: { pin },
          include: {
            game: {
              include: {
                questions: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        });

        if (!room) {
          socket.emit(WS_EVENTS.ERROR, {
            code: 'ROOM_NOT_FOUND',
            message: 'Room not found',
          });
          return;
        }

        if (new Date() > room.expiresAt) {
          socket.emit(WS_EVENTS.ERROR, {
            code: 'ROOM_EXPIRED',
            message: 'Room has expired',
          });
          return;
        }

        let state = await roomStateService.getRoomState(pin);

        if (!state) {
          state = {
            roomId: room.id,
            pin,
            gameId: room.gameId,
            organizerId: room.organizerId,
            status: 'waiting',
            players: {},
            currentQuestionIndex: -1,
          };
          await roomStateService.setRoomState(pin, state);
        }

        const existingNickname = Object.values(state.players).find(
          (p) => p.nickname === nickname,
        );
        if (existingNickname) {
          socket.emit(WS_EVENTS.ERROR, {
            code: 'DUPLICATE_NICKNAME',
            message: 'Nickname already taken',
          });
          return;
        }

        const isOrganizer =
          authSocket.user !== undefined && authSocket.user.id === room.organizerId;

        const player: Player = {
          id: socket.id,
          nickname,
          socketId: socket.id,
          score: 0,
          answers: {},
          isOrganizer,
          joinedAt: new Date(),
        };

        state = await roomStateService.addPlayer(pin, player);

        if (!state) {
          socket.emit(WS_EVENTS.ERROR, {
            code: 'ROOM_ERROR',
            message: 'Failed to join room',
          });
          return;
        }

        await socket.join(`room:${pin}`);

        socket.emit(WS_EVENTS.JOINED_ROOM, {
          room: state,
          game: room.game,
        });

        socket.to(`room:${pin}`).emit(WS_EVENTS.PARTICIPANT_JOINED, {
          player,
          playerCount: Object.keys(state.players).length,
        });

        console.log(`Player ${nickname} joined room ${pin}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit(WS_EVENTS.ERROR, {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        });
      }
    },
  );

  socket.on(WS_EVENTS.DISCONNECT, async () => {
    try {
      const rooms = Array.from(socket.rooms).filter((r) => r.startsWith('room:'));

      for (const roomName of rooms) {
        const pin = roomName.replace('room:', '');
        const state = await roomStateService.removePlayer(pin, socket.id);

        if (state) {
          io.to(`room:${pin}`).emit(WS_EVENTS.PARTICIPANT_LEFT, {
            playerId: socket.id,
            playerCount: Object.keys(state.players).length,
          });

          console.log(`Player ${socket.id} left room ${pin}`);
        }
      }
    } catch (error) {
      console.error('Error on disconnect:', error);
    }
  });
}
