import { Server, Socket } from 'socket.io';
import { WS_EVENTS, parseQuestionData, getQuestionDuration, getQuestionType } from '@xingu/shared';
import { logger } from '@xingu/shared/logger';
import { prisma } from '../config/database';
import { roomStateService } from '../services/room-state.service';
import { participantSessionService } from '../services/participant-session.service';
import { scoreCalculator } from '../services/score-calculator.service';
import { AuthenticatedSocket } from '../middleware/ws-auth.middleware';

/**
 * Increment playCount for the game and its source template (if copied from one).
 * This should be called when a game session ends to track play statistics.
 */
async function incrementPlayCount(gameId: string): Promise<void> {
  try {
    // Get game details to check for sourceGameId
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true, sourceGameId: true },
    });

    if (!game) {
      logger.warn('Game not found for playCount increment', { gameId });
      return;
    }

    // Increment playCount for the played game
    await prisma.game.update({
      where: { id: gameId },
      data: {
        playCount: {
          increment: 1,
        },
      },
    });

    // If this game was copied from a template, increment source template's playCount too
    if (game.sourceGameId) {
      const sourceGame = await prisma.game.findUnique({
        where: { id: game.sourceGameId },
        select: { id: true, isPublic: true },
      });

      // Only increment if source is a public template
      if (sourceGame?.isPublic) {
        await prisma.game.update({
          where: { id: game.sourceGameId },
          data: {
            playCount: {
              increment: 1,
            },
          },
        });
      }
    }

    logger.info('PlayCount incremented', { gameId, sourceGameId: game.sourceGameId });
  } catch (error) {
    // Log but don't fail the request if playCount increment fails
    logger.error('Failed to increment playCount', { gameId, error });
  }
}

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

      // Update PostgreSQL room status to prevent new joins
      await prisma.room.update({
        where: { pin },
        data: {
          status: 'PLAYING',
          startedAt: new Date(),
        },
      });

      io.to(`room:${pin}`).emit(WS_EVENTS.GAME_STARTED, {
        room: updatedState,
      });

      // Automatically start the first question if available
      if (room.game.questions.length > 0) {
        const firstQuestionState = await roomStateService.nextQuestion(pin);
        if (firstQuestionState) {
          const firstQuestion = room.game.questions[firstQuestionState.currentQuestionIndex];
          if (firstQuestion) {
            io.to(`room:${pin}`).emit(WS_EVENTS.QUESTION_STARTED, {
              questionIndex: firstQuestionState.currentQuestionIndex,
              question: firstQuestion,
              startedAt: firstQuestionState.currentQuestionStartedAt,
            });
            logger.info('Game started in room with question', { pin, questionIndex: firstQuestionState.currentQuestionIndex });
          } else {
            logger.warn('Game started but question not found', { pin, questionIndex: firstQuestionState.currentQuestionIndex });
          }
        }
      } else {
        logger.info('Game started in room (no questions)', { pin });
      }
    } catch (error) {
      logger.error('Error starting game', { error });
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
        // No more questions - end the game
        const finalState = await roomStateService.updateRoomStatus(pin, 'finished');
        if (finalState) {
          const finalPlayers = Object.values(finalState.players);
          const finalLeaderboard = finalPlayers
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map((p, index) => ({
              rank: index + 1,
              nickname: p.nickname,
              score: p.score,
            }));

          await prisma.gameResult.create({
            data: {
              roomId: finalState.roomId,
              participantCount: finalPlayers.length,
              duration: finalState.startedAt
                ? Math.floor(
                    (new Date().getTime() - new Date(finalState.startedAt).getTime()) / 1000,
                  )
                : 0,
              averageScore:
                finalPlayers.reduce((sum, p) => sum + p.score, 0) / finalPlayers.length || 0,
              leaderboard: finalLeaderboard as never,
              questionStats: {} as never,
            },
          });

          // Increment playCount for the game and source template
          await incrementPlayCount(finalState.gameId);

          await prisma.room.update({
            where: { pin },
            data: {
              status: 'FINISHED',
              endedAt: new Date(),
            },
          });

          io.to(`room:${pin}`).emit(WS_EVENTS.GAME_ENDED, {
            leaderboard: finalLeaderboard,
            room: finalState,
          });

          logger.info('Game ended in room', { pin });

          // Room state will be automatically cleaned up by Redis TTL (24 hours)
        }
        return;
      }

      io.to(`room:${pin}`).emit(WS_EVENTS.QUESTION_STARTED, {
        questionIndex: updatedState.currentQuestionIndex,
        question: currentQuestion,
        startedAt: updatedState.currentQuestionStartedAt,
      });

      logger.info('Question started in room', { pin, questionIndex: updatedState.currentQuestionIndex });
    } catch (error) {
      logger.error('Error advancing question', { error });
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

        // Find player by socket ID
        const player = Object.values(state.players).find((p) => p.socketId === socket.id);
        if (!player) {
          socket.emit(WS_EVENTS.ERROR, {
            code: 'PLAYER_NOT_FOUND',
            message: 'Player not found',
          });
          return;
        }

        // participantId is player.id (not socket.id)
        const participantId = player.id;

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

        // Parse and validate question data
        const questionData = parseQuestionData(question.data);
        if (!questionData) {
          socket.emit(WS_EVENTS.ERROR, {
            code: 'INVALID_QUESTION_DATA',
            message: 'Invalid question data format',
          });
          return;
        }

        // Calculate score with type-safe data
        const isCorrect = scoreCalculator.checkAnswer(question, answer);
        const questionDuration = getQuestionDuration(questionData, 30);
        const questionType = getQuestionType(questionData);
        const scoreResult = scoreCalculator.calculateScore(questionType, {
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

        // Update RoomState (keyed by participantId, not socket.id)
        const updatedState = await roomStateService.updatePlayer(pin, participantId, updatedPlayer);

        // Update Redis session for session recovery
        await participantSessionService.addAnswer(
          participantId,
          questionIndex,
          answer,
          isCorrect,
          scoreResult.points,
          responseTimeMs
        );

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

        // Broadcast updated room state to all for real-time answer tracking
        if (updatedState) {
          io.to(`room:${pin}`).emit(WS_EVENTS.STATE_SYNCED, {
            room: updatedState,
          });

          // Check if all participants have answered
          const allPlayers = Object.values(updatedState.players);
          const answeredCount = allPlayers.filter(
            (p) => p.answers[questionIndex] !== undefined,
          ).length;

          logger.info('Player answered question', {
            pin,
            questionIndex,
            nickname: player.nickname,
            isCorrect,
            points: scoreResult.points,
            answeredCount,
            totalPlayers: allPlayers.length,
          });

          // Auto-reveal answers when all participants have answered
          if (answeredCount === allPlayers.length && allPlayers.length > 0) {
            logger.info('All players answered question, auto-revealing answers', { pin, questionIndex });

            // Get question details for answer reveal
            const questionRoom = await prisma.room.findUnique({
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

            if (questionRoom) {
              const revealQuestion = questionRoom.game.questions[questionIndex];
              if (revealQuestion) {
                // Parse question data for type-safe access
                const revealQuestionData = parseQuestionData(revealQuestion.data);
                if (!revealQuestionData) {
                  logger.error('Invalid question data', { pin, questionIndex });
                  return;
                }

                // Collect all answers and calculate results
                const results = allPlayers.map((p) => {
                  const answerData = p.answers[questionIndex] as {
                    answer: unknown;
                    isCorrect: boolean;
                    points: number;
                    responseTimeMs: number;
                  } | undefined;
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
                const leaderboard = allPlayers
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
                  correctAnswer: revealQuestionData.correctAnswer,
                  results,
                  leaderboard,
                  statistics: {
                    totalAnswers: results.filter((r) => r.answer !== undefined).length,
                    correctAnswers: results.filter((r) => r.isCorrect).length,
                    averageResponseTime:
                      results.reduce((sum, r) => sum + (r.responseTimeMs || 0), 0) / results.length,
                  },
                });

                logger.info('Question ended, waiting for organizer to advance', { pin, questionIndex });
              }
            }
          }
        } else {
          logger.info('Player answered question', {
            pin,
            questionIndex,
            nickname: player.nickname,
            isCorrect,
            points: scoreResult.points,
          });
        }
      } catch (error) {
        logger.error('Error submitting answer', { error });
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

      // Parse question data for type-safe access
      const endQuestionData = parseQuestionData(question.data);
      if (!endQuestionData) {
        socket.emit(WS_EVENTS.ERROR, {
          code: 'INVALID_QUESTION_DATA',
          message: 'Invalid question data format',
        });
        return;
      }

      // Collect all answers and calculate results
      const playersList = Object.values(state.players);
      const results = playersList.map((p) => {
        const answerData = p.answers[questionIndex] as {
          answer: unknown;
          isCorrect: boolean;
          points: number;
          responseTimeMs: number;
        } | undefined;
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
        correctAnswer: endQuestionData.correctAnswer,
        results,
        leaderboard,
        statistics: {
          totalAnswers: results.filter((r) => r.answer !== undefined).length,
          correctAnswers: results.filter((r) => r.isCorrect).length,
          averageResponseTime:
            results.reduce((sum, r) => sum + (r.responseTimeMs || 0), 0) / results.length,
        },
      });

      logger.info('Question ended in room', { pin, questionIndex });

      // Auto-advance to next question after 5 seconds (Kahoot-style)
      setTimeout(async () => {
        const totalQuestions = room.game.questions.length;

        if (questionIndex + 1 < totalQuestions) {
          // Move to next question
          const nextState = await roomStateService.nextQuestion(pin);
          if (nextState) {
            const nextQuestion = room.game.questions[nextState.currentQuestionIndex];
            if (nextQuestion) {
              io.to(`room:${pin}`).emit(WS_EVENTS.QUESTION_STARTED, {
                questionIndex: nextState.currentQuestionIndex,
                question: nextQuestion,
                startedAt: nextState.currentQuestionStartedAt,
              });
              logger.info('Auto-advanced to question', { pin, questionIndex: nextState.currentQuestionIndex });
            }
          }
        } else {
          // Last question - end game
          const finalState = await roomStateService.updateRoomStatus(pin, 'finished');
          if (finalState) {
            const finalPlayers = Object.values(finalState.players);
            const finalLeaderboard = finalPlayers
              .sort((a, b) => b.score - a.score)
              .slice(0, 10)
              .map((p, index) => ({
                rank: index + 1,
                nickname: p.nickname,
                score: p.score,
              }));

            await prisma.gameResult.create({
              data: {
                roomId: finalState.roomId,
                participantCount: finalPlayers.length,
                duration: finalState.startedAt
                  ? Math.floor(
                      (new Date().getTime() - new Date(finalState.startedAt).getTime()) / 1000,
                    )
                  : 0,
                averageScore:
                  finalPlayers.reduce((sum, p) => sum + p.score, 0) / finalPlayers.length || 0,
                leaderboard: finalLeaderboard as never,
                questionStats: {} as never,
              },
            });

            // Increment playCount for the game and source template
            await incrementPlayCount(finalState.gameId);

            await prisma.room.update({
              where: { pin },
              data: {
                status: 'FINISHED',
                endedAt: new Date(),
              },
            });

            io.to(`room:${pin}`).emit(WS_EVENTS.GAME_ENDED, {
              leaderboard: finalLeaderboard,
              room: finalState,
            });

            logger.info('Game auto-ended in room', { pin });

            // Room state will be automatically cleaned up by Redis TTL (24 hours)
          }
        }
      }, 5000);
    } catch (error) {
      logger.error('Error ending question', { error });
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

      // Increment playCount for the game and source template
      await incrementPlayCount(updatedState.gameId);

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

      logger.info('Game ended in room', { pin });

      // Room state will be automatically cleaned up by Redis TTL (24 hours)
    } catch (error) {
      logger.error('Error ending game', { error });
      socket.emit(WS_EVENTS.ERROR, {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      });
    }
  });
}
