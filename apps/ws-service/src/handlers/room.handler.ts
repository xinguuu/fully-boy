import { Server, Socket } from 'socket.io';
import { WS_EVENTS } from '@xingu/shared';
import { prisma } from '../config/database';
import { roomStateService } from '../services/room-state.service';
import { participantSessionService } from '../services/participant-session.service';
import { Player } from '../types/room.types';
import { AuthenticatedSocket } from '../middleware/ws-auth.middleware';
import { generateParticipantId } from '../utils/uuid';

export function setupRoomHandlers(io: Server, socket: Socket) {
  socket.on(
    WS_EVENTS.JOIN_ROOM,
    async (data: { pin: string; nickname?: string; participantId?: string }) => {
      try {
        const authSocket = socket as AuthenticatedSocket;
        const { pin, nickname, participantId } = data;

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

        // Check if user is organizer
        const isOrganizer =
          authSocket.user !== undefined && authSocket.user.id === room.organizerId;

        // Initialize or get room state
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

        // Join the room namespace
        await socket.join(`room:${pin}`);

        // === ORGANIZER LOGIC ===
        if (isOrganizer) {
          // Organizer joins room but is NOT added to players list
          socket.emit(WS_EVENTS.JOINED_ROOM, {
            role: 'organizer',
            room: state,
            game: room.game,
          });

          // If game is already playing, send current question
          if (state.status === 'playing' && state.currentQuestionIndex >= 0) {
            const currentQuestion = room.game.questions[state.currentQuestionIndex];
            if (currentQuestion) {
              socket.emit(WS_EVENTS.QUESTION_STARTED, {
                questionIndex: state.currentQuestionIndex,
                question: currentQuestion,
                startedAt: state.currentQuestionStartedAt,
              });
              console.log(`Sent current question ${state.currentQuestionIndex} to organizer (reconnection)`);
            }
          }

          console.log(`Organizer (User ID: ${authSocket.user!.id}) joined room ${pin}`);
          return;
        }

        // === PARTICIPANT LOGIC ===
        if (!nickname) {
          socket.emit(WS_EVENTS.ERROR, {
            code: 'NICKNAME_REQUIRED',
            message: 'Nickname is required for participants',
          });
          return;
        }

        // Check for duplicate nickname (only if not restoring session)
        const existingNickname = Object.values(state.players).find(
          (p) => p.nickname === nickname,
        );

        let finalParticipantId = participantId || generateParticipantId();
        let session = null;
        let sessionRestored = false;

        // Try to restore session if participantId provided
        if (participantId) {
          const validation = await participantSessionService.validateSession(
            participantId,
            pin
          );

          if (validation.isValid && validation.session) {
            session = validation.session;
            sessionRestored = true;
            finalParticipantId = participantId;

            console.log(
              `Session restored for ${nickname} (ID: ${participantId}) - Score: ${session.score}, QuestionIndex: ${session.currentQuestionIndex}`
            );
          } else {
            // Session invalid or expired - generate new one
            finalParticipantId = generateParticipantId();
          }
        }

        // Check duplicate nickname only for new participants
        if (!sessionRestored && existingNickname) {
          socket.emit(WS_EVENTS.ERROR, {
            code: 'DUPLICATE_NICKNAME',
            message: 'Nickname already taken',
          });
          return;
        }

        // Create or update participant session in Redis
        if (!session) {
          session = await participantSessionService.createSession(
            finalParticipantId,
            pin,
            nickname
          );
        } else {
          // Refresh session TTL
          await participantSessionService.refreshSession(finalParticipantId);
        }

        // Create player object for RoomState
        const player: Player = {
          id: finalParticipantId,
          nickname,
          socketId: socket.id,
          score: session.score,
          answers: session.answers as any,
          isOrganizer: false,
          joinedAt: new Date(session.joinedAt),
        };

        // Add player to room state
        state = await roomStateService.addPlayer(pin, player);

        if (!state) {
          socket.emit(WS_EVENTS.ERROR, {
            code: 'ROOM_ERROR',
            message: 'Failed to join room',
          });
          return;
        }

        // Send confirmation to participant
        socket.emit(WS_EVENTS.JOINED_ROOM, {
          role: 'participant',
          participantId: finalParticipantId,
          room: state,
          game: room.game,
          sessionRestored,
        });

        // Send session restored event if applicable
        if (sessionRestored && session) {
          socket.emit(WS_EVENTS.SESSION_RESTORED, {
            participantId: finalParticipantId,
            currentQuestionIndex: session.currentQuestionIndex,
            score: session.score,
            nickname: session.nickname,
            message: 'Session restored successfully',
          });
        }

        // If game is already playing, send current question
        if (state.status === 'playing' && state.currentQuestionIndex >= 0) {
          const currentQuestion = room.game.questions[state.currentQuestionIndex];
          if (currentQuestion) {
            socket.emit(WS_EVENTS.QUESTION_STARTED, {
              questionIndex: state.currentQuestionIndex,
              question: currentQuestion,
              startedAt: state.currentQuestionStartedAt,
            });
            console.log(`Sent current question ${state.currentQuestionIndex} to participant ${nickname} (reconnection)`);
          }
        }

        // Notify others in the room (including organizer)
        socket.to(`room:${pin}`).emit(WS_EVENTS.PARTICIPANT_JOINED, {
          player,
          playerCount: Object.keys(state.players).length,
        });

        console.log(
          `Participant ${nickname} (ID: ${finalParticipantId}) joined room ${pin} ${sessionRestored ? '[SESSION RESTORED]' : '[NEW]'}`
        );
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
