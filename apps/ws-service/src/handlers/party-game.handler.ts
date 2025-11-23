import { Server, Socket } from 'socket.io';
import { WS_EVENTS, REDIS_KEYS, REDIS_TTL, gameTypeRegistry } from '@xingu/shared';
import type { SessionState, GameAction } from '@xingu/shared';
import { logger } from '@xingu/shared/logger';
import { redis } from '../config/redis';
import { prisma } from '../config/database';
import { AuthenticatedSocket } from '../middleware/ws-auth.middleware';

/**
 * Setup party game WebSocket event handlers
 *
 * Party games use SessionState instead of question-based flow.
 * Plugins process actions and update session state.
 */
export function setupPartyGameHandlers(io: Server, socket: Socket) {
  /**
   * Handle generic game action from participant
   * The plugin's processAction() method will handle the logic
   */
  socket.on(
    WS_EVENTS.GAME_ACTION,
    async (data: { pin: string; action: Omit<GameAction, 'playerId' | 'timestamp'> }) => {
      try {
        const { pin, action } = data;

        // Get current session state
        const sessionKey = REDIS_KEYS.PARTY_GAME_SESSION(pin);
        const sessionData = await redis.get(sessionKey);

        if (!sessionData) {
          socket.emit(WS_EVENTS.ERROR, {
            code: 'SESSION_NOT_FOUND',
            message: 'Party game session not found',
          });
          return;
        }

        const sessionState: SessionState = JSON.parse(sessionData);

        // Get game info to find the plugin
        const room = await prisma.room.findUnique({
          where: { pin },
          include: {
            game: {
              select: {
                gameType: true,
                gameCategory: true,
              },
            },
          },
        });

        if (!room || room.game.gameCategory !== 'PARTY') {
          socket.emit(WS_EVENTS.ERROR, {
            code: 'INVALID_GAME_TYPE',
            message: 'This is not a party game',
          });
          return;
        }

        // Get the plugin for this game type
        const plugin = gameTypeRegistry.get(room.game.gameType);

        if (!plugin) {
          socket.emit(WS_EVENTS.ERROR, {
            code: 'PLUGIN_NOT_FOUND',
            message: `Plugin not found for game type: ${room.game.gameType}`,
          });
          return;
        }

        // Check if plugin supports party game actions
        if (!plugin.processAction) {
          socket.emit(WS_EVENTS.ERROR, {
            code: 'INVALID_PLUGIN',
            message: 'This plugin does not support party game actions',
          });
          return;
        }

        // Build complete game action with playerId (using socket.id) and timestamp
        const completeAction: GameAction = {
          ...action,
          playerId: socket.id,
          timestamp: new Date(),
        };

        // Process action through plugin
        const updatedSession = plugin.processAction(sessionState, completeAction);

        // Save updated session state
        await redis.setex(sessionKey, REDIS_TTL.ROOM_STATE, JSON.stringify(updatedSession));

        // Broadcast updated session to all participants in the room
        io.to(`room:${pin}`).emit(WS_EVENTS.SESSION_UPDATED, {
          session: updatedSession,
        });
      } catch (error) {
        logger.error('Error processing game action', { error, pin: data.pin });
        socket.emit(WS_EVENTS.ERROR, {
          code: 'ACTION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to process action',
        });
      }
    }
  );

  /**
   * Handle organizer advancing to next phase
   * This is useful for games with discrete phases
   */
  socket.on(WS_EVENTS.NEXT_PHASE, async (data: { pin: string }) => {
    try {
      const { pin } = data;
      const authSocket = socket as AuthenticatedSocket;

      // Get current session state
      const sessionKey = REDIS_KEYS.PARTY_GAME_SESSION(pin);
      const sessionData = await redis.get(sessionKey);

      if (!sessionData) {
        socket.emit(WS_EVENTS.ERROR, {
          code: 'SESSION_NOT_FOUND',
          message: 'Party game session not found',
        });
        return;
      }

      const sessionState: SessionState = JSON.parse(sessionData);

      // Verify organizer
      const room = await prisma.room.findUnique({
        where: { pin },
      });

      if (!room) {
        socket.emit(WS_EVENTS.ERROR, {
          code: 'ROOM_NOT_FOUND',
          message: 'Room not found',
        });
        return;
      }

      if (!authSocket.user || authSocket.user.id !== room.organizerId) {
        socket.emit(WS_EVENTS.ERROR, {
          code: 'NOT_ORGANIZER',
          message: 'Only organizer can advance to next phase',
        });
        return;
      }

      // Simple phase advancement (increment round)
      // Plugins can implement more complex phase logic via processAction
      const updatedSession: SessionState = {
        ...sessionState,
        round: sessionState.round + 1,
      };

      // Save updated session state
      await redis.setex(sessionKey, REDIS_TTL.ROOM_STATE, JSON.stringify(updatedSession));

      // Broadcast updated session
      io.to(`room:${pin}`).emit(WS_EVENTS.SESSION_UPDATED, {
        session: updatedSession,
      });
    } catch (error) {
      logger.error('Error advancing phase', { error, pin: data.pin });
      socket.emit(WS_EVENTS.ERROR, {
        code: 'PHASE_ADVANCE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to advance phase',
      });
    }
  });
}
