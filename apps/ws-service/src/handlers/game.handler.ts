import { Server, Socket } from 'socket.io';
import { WS_EVENTS } from '@xingu/shared';
import { prisma } from '../config/database';
import { roomStateService } from '../services/room-state.service';

export function setupGameHandlers(io: Server, socket: Socket) {
  socket.on(WS_EVENTS.START_GAME, async (data: { pin: string }) => {
    try {
      const { pin } = data;

      const state = await roomStateService.getRoomState(pin);

      if (!state) {
        socket.emit(WS_EVENTS.ERROR, {
          code: 'ROOM_NOT_FOUND',
          message: 'Room not found',
        });
        return;
      }

      const player = state.players[socket.id];
      if (!player || !player.isOrganizer) {
        socket.emit(WS_EVENTS.ERROR, {
          code: 'NOT_ORGANIZER',
          message: 'Only organizer can start the game',
        });
        return;
      }

      if (state.status !== 'waiting') {
        socket.emit(WS_EVENTS.ERROR, {
          code: 'INVALID_STATE',
          message: 'Game already started',
        });
        return;
      }

      const playerCount = Object.keys(state.players).length;
      if (playerCount < 2) {
        socket.emit(WS_EVENTS.ERROR, {
          code: 'NO_PARTICIPANTS',
          message: 'Not enough players',
        });
        return;
      }

      const updatedState = await roomStateService.updateRoomStatus(pin, 'playing');

      if (!updatedState) {
        socket.emit(WS_EVENTS.ERROR, {
          code: 'ROOM_ERROR',
          message: 'Failed to start game',
        });
        return;
      }

      io.to(`room:${pin}`).emit(WS_EVENTS.GAME_STARTED, {
        room: updatedState,
      });

      console.log(`Game started in room ${pin}`);
    } catch (error) {
      console.error('Error starting game:', error);
      socket.emit(WS_EVENTS.ERROR, {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      });
    }
  });

  socket.on(WS_EVENTS.NEXT_QUESTION, async (data: { pin: string }) => {
    try {
      const { pin } = data;

      const state = await roomStateService.getRoomState(pin);

      if (!state) {
        socket.emit(WS_EVENTS.ERROR, {
          code: 'ROOM_NOT_FOUND',
          message: 'Room not found',
        });
        return;
      }

      const player = state.players[socket.id];
      if (!player || !player.isOrganizer) {
        socket.emit(WS_EVENTS.ERROR, {
          code: 'NOT_ORGANIZER',
          message: 'Only organizer can control questions',
        });
        return;
      }

      if (state.status !== 'playing') {
        socket.emit(WS_EVENTS.ERROR, {
          code: 'INVALID_STATE',
          message: 'Game not started',
        });
        return;
      }

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

      const updatedState = await roomStateService.nextQuestion(pin);

      if (!updatedState) {
        socket.emit(WS_EVENTS.ERROR, {
          code: 'ROOM_ERROR',
          message: 'Failed to advance question',
        });
        return;
      }

      const currentQuestion = room.game.questions[updatedState.currentQuestionIndex];

      if (!currentQuestion) {
        socket.emit(WS_EVENTS.ERROR, {
          code: 'NO_MORE_QUESTIONS',
          message: 'No more questions',
        });
        return;
      }

      io.to(`room:${pin}`).emit(WS_EVENTS.QUESTION_STARTED, {
        questionIndex: updatedState.currentQuestionIndex,
        question: currentQuestion,
      });

      console.log(`Question ${updatedState.currentQuestionIndex} started in room ${pin}`);
    } catch (error) {
      console.error('Error advancing question:', error);
      socket.emit(WS_EVENTS.ERROR, {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      });
    }
  });

  socket.on(
    WS_EVENTS.SUBMIT_ANSWER,
    async (data: { pin: string; questionIndex: number; answer: unknown }) => {
      try {
        const { pin, questionIndex, answer } = data;

        const state = await roomStateService.getRoomState(pin);

        if (!state) {
          socket.emit(WS_EVENTS.ERROR, {
            code: 'ROOM_NOT_FOUND',
            message: 'Room not found',
          });
          return;
        }

        if (state.status !== 'playing') {
          socket.emit(WS_EVENTS.ERROR, {
            code: 'INVALID_STATE',
            message: 'Game not in progress',
          });
          return;
        }

        const player = state.players[socket.id];
        if (!player) {
          socket.emit(WS_EVENTS.ERROR, {
            code: 'PLAYER_NOT_FOUND',
            message: 'Player not found',
          });
          return;
        }

        if (player.answers[questionIndex]) {
          socket.emit(WS_EVENTS.ERROR, {
            code: 'ALREADY_ANSWERED',
            message: 'Already answered this question',
          });
          return;
        }

        const updatedPlayer = {
          ...player,
          answers: {
            ...player.answers,
            [questionIndex]: answer,
          },
        };

        await roomStateService.updatePlayer(pin, socket.id, updatedPlayer);

        socket.emit(WS_EVENTS.ANSWER_RECEIVED, {
          questionIndex,
          answer,
        });

        socket.to(`room:${pin}`).emit(WS_EVENTS.ANSWER_SUBMITTED, {
          playerId: socket.id,
          playerNickname: player.nickname,
          questionIndex,
        });

        console.log(
          `Player ${player.nickname} answered question ${questionIndex} in room ${pin}`,
        );
      } catch (error) {
        console.error('Error submitting answer:', error);
        socket.emit(WS_EVENTS.ERROR, {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        });
      }
    },
  );

  socket.on(WS_EVENTS.END_GAME, async (data: { pin: string }) => {
    try {
      const { pin } = data;

      const state = await roomStateService.getRoomState(pin);

      if (!state) {
        socket.emit(WS_EVENTS.ERROR, {
          code: 'ROOM_NOT_FOUND',
          message: 'Room not found',
        });
        return;
      }

      const player = state.players[socket.id];
      if (!player || !player.isOrganizer) {
        socket.emit(WS_EVENTS.ERROR, {
          code: 'NOT_ORGANIZER',
          message: 'Only organizer can end the game',
        });
        return;
      }

      const updatedState = await roomStateService.updateRoomStatus(pin, 'finished');

      if (!updatedState) {
        socket.emit(WS_EVENTS.ERROR, {
          code: 'ROOM_ERROR',
          message: 'Failed to end game',
        });
        return;
      }

      const playersList = Object.values(updatedState.players);
      const leaderboard = playersList
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((p, index) => ({
          rank: index + 1,
          nickname: p.nickname,
          score: p.score,
        }));

      await prisma.gameResult.create({
        data: {
          roomId: updatedState.roomId,
          participantCount: playersList.length,
          duration: updatedState.startedAt
            ? Math.floor(
                (new Date().getTime() - new Date(updatedState.startedAt).getTime()) / 1000,
              )
            : 0,
          averageScore:
            playersList.reduce((sum, p) => sum + p.score, 0) / playersList.length || 0,
          leaderboard: leaderboard as never,
          questionStats: {} as never,
        },
      });

      await prisma.room.update({
        where: { pin },
        data: {
          status: 'FINISHED',
          endedAt: new Date(),
        },
      });

      io.to(`room:${pin}`).emit(WS_EVENTS.GAME_ENDED, {
        leaderboard,
        room: updatedState,
      });

      console.log(`Game ended in room ${pin}`);

      setTimeout(async () => {
        await roomStateService.deleteRoomState(pin);
      }, 300000);
    } catch (error) {
      console.error('Error ending game:', error);
      socket.emit(WS_EVENTS.ERROR, {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      });
    }
  });
}
