import { Server, Socket } from 'socket.io';
import { WS_EVENTS } from '@xingu/shared';
import { prisma } from '../config/database';
import { roomStateService } from '../services/room-state.service';
import { scoreCalculator } from '../services/score-calculator.service';
import { AuthenticatedSocket } from '../middleware/ws-auth.middleware';

export function setupGameHandlers(io: Server, socket: Socket) {
  socket.on(WS_EVENTS.START_GAME, async (data: { pin: string }) => {
    try {
      const authSocket = socket as AuthenticatedSocket;
      const { pin } = data;

      const state = await roomStateService.getRoomState(pin);

      if (!state) {
        socket.emit(WS_EVENTS.ERROR, {
          code: 'ROOM_NOT_FOUND',
          message: 'Room not found',
        });
        return;
      }

      // Check if the authenticated user is the organizer
      if (!authSocket.user || authSocket.user.id !== state.organizerId) {
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

      // Check participant count from database (REST API joins)
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

      // Note: Participants are counted via REST API joins, not WebSocket connections
      // For development/testing, we allow starting with 0 participants (organizer only)
      // In production, you may want to enforce: if (room.participantCount < 1)

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

      // Automatically start the first question
      const firstQuestionState = await roomStateService.nextQuestion(pin);
      if (firstQuestionState && room.game.questions.length > 0) {
        const firstQuestion = room.game.questions[0];
        io.to(`room:${pin}`).emit(WS_EVENTS.QUESTION_STARTED, {
          questionIndex: 0,
          question: firstQuestion,
        });
        console.log(`Game started in room ${pin} with first question`);
      } else {
        console.log(`Game started in room ${pin} (no questions)`);
      }
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
      const authSocket = socket as AuthenticatedSocket;
      const { pin } = data;

      const state = await roomStateService.getRoomState(pin);

      if (!state) {
        socket.emit(WS_EVENTS.ERROR, {
          code: 'ROOM_NOT_FOUND',
          message: 'Room not found',
        });
        return;
      }

      // Check if the authenticated user is the organizer
      if (!authSocket.user || authSocket.user.id !== state.organizerId) {
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
    async (data: {
      pin: string;
      questionIndex: number;
      answer: unknown;
      responseTimeMs: number;
    }) => {
      try {
        const { pin, questionIndex, answer, responseTimeMs } = data;

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

        // Get question details for score calculation
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

        const question = room.game.questions[questionIndex];
        if (!question) {
          socket.emit(WS_EVENTS.ERROR, {
            code: 'QUESTION_NOT_FOUND',
            message: 'Question not found',
          });
          return;
        }

        // Calculate score
        const isCorrect = scoreCalculator.checkAnswer(question, answer);
        const questionDuration = (question.data as any).duration || 30; // Default 30s
        const scoreResult = scoreCalculator.calculateScore({
          isCorrect,
          responseTimeMs,
          questionDuration,
        });

        const updatedPlayer = {
          ...player,
          score: player.score + scoreResult.points,
          answers: {
            ...player.answers,
            [questionIndex]: {
              answer,
              isCorrect,
              points: scoreResult.points,
              responseTimeMs,
              submittedAt: new Date(),
            },
          },
        };

        await roomStateService.updatePlayer(pin, socket.id, updatedPlayer);

        // Send confirmation to player with score
        socket.emit(WS_EVENTS.ANSWER_RECEIVED, {
          questionIndex,
          answer,
          isCorrect,
          points: scoreResult.points,
          breakdown: scoreResult.breakdown,
        });

        // Notify others that player answered (without revealing correctness)
        socket.to(`room:${pin}`).emit(WS_EVENTS.ANSWER_SUBMITTED, {
          playerId: socket.id,
          playerNickname: player.nickname,
          questionIndex,
        });

        console.log(
          `Player ${player.nickname} answered question ${questionIndex} in room ${pin}: ${isCorrect ? 'CORRECT' : 'WRONG'} (+${scoreResult.points} pts)`,
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

  socket.on(WS_EVENTS.END_QUESTION, async (data: { pin: string; questionIndex: number }) => {
    try {
      const authSocket = socket as AuthenticatedSocket;
      const { pin, questionIndex } = data;

      const state = await roomStateService.getRoomState(pin);

      if (!state) {
        socket.emit(WS_EVENTS.ERROR, {
          code: 'ROOM_NOT_FOUND',
          message: 'Room not found',
        });
        return;
      }

      // Check if the authenticated user is the organizer
      if (!authSocket.user || authSocket.user.id !== state.organizerId) {
        socket.emit(WS_EVENTS.ERROR, {
          code: 'NOT_ORGANIZER',
          message: 'Only organizer can end questions',
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

      // Get question details
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

      const question = room.game.questions[questionIndex];
      if (!question) {
        socket.emit(WS_EVENTS.ERROR, {
          code: 'QUESTION_NOT_FOUND',
          message: 'Question not found',
        });
        return;
      }

      // Collect all answers and calculate results
      const playersList = Object.values(state.players);
      const results = playersList.map((p) => {
        const answerData = p.answers[questionIndex] as any;
        return {
          playerId: p.id,
          nickname: p.nickname,
          answer: answerData?.answer,
          isCorrect: answerData?.isCorrect || false,
          points: answerData?.points || 0,
          responseTimeMs: answerData?.responseTimeMs,
          currentScore: p.score,
        };
      });

      // Generate current leaderboard
      const leaderboard = playersList
        .sort((a, b) => b.score - a.score)
        .map((p, index) => ({
          rank: index + 1,
          playerId: p.id,
          nickname: p.nickname,
          score: p.score,
        }));

      // Broadcast results to all players
      io.to(`room:${pin}`).emit(WS_EVENTS.QUESTION_ENDED, {
        questionIndex,
        correctAnswer: (question.data as any).correctAnswer,
        results,
        leaderboard,
        statistics: {
          totalAnswers: results.filter((r) => r.answer !== undefined).length,
          correctAnswers: results.filter((r) => r.isCorrect).length,
          averageResponseTime:
            results.reduce((sum, r) => sum + (r.responseTimeMs || 0), 0) / results.length,
        },
      });

      console.log(`Question ${questionIndex} ended in room ${pin}`);
    } catch (error) {
      console.error('Error ending question:', error);
      socket.emit(WS_EVENTS.ERROR, {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      });
    }
  });

  socket.on(WS_EVENTS.END_GAME, async (data: { pin: string }) => {
    try {
      const authSocket = socket as AuthenticatedSocket;
      const { pin } = data;

      const state = await roomStateService.getRoomState(pin);

      if (!state) {
        socket.emit(WS_EVENTS.ERROR, {
          code: 'ROOM_NOT_FOUND',
          message: 'Room not found',
        });
        return;
      }

      // Check if the authenticated user is the organizer
      if (!authSocket.user || authSocket.user.id !== state.organizerId) {
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
