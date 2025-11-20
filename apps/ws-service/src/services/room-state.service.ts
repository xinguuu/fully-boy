import { redis } from '../config/redis';
import { RoomState, Player } from '../types/room.types';
import { REDIS_KEYS, REDIS_TTL } from '@xingu/shared';

export class RoomStateService {
  async getRoomState(pin: string): Promise<RoomState | null> {
    const data = await redis.get(REDIS_KEYS.ROOM_STATE(pin));
    if (!data) return null;
    return JSON.parse(data);
  }

  async setRoomState(pin: string, state: RoomState): Promise<void> {
    await redis.setex(REDIS_KEYS.ROOM_STATE(pin), REDIS_TTL.ROOM_STATE, JSON.stringify(state));
  }

  async deleteRoomState(pin: string): Promise<void> {
    await redis.del(REDIS_KEYS.ROOM_STATE(pin));
  }

  async addPlayer(pin: string, player: Player): Promise<RoomState | null> {
    const state = await this.getRoomState(pin);
    if (!state) return null;

    state.players[player.id] = player;
    await this.setRoomState(pin, state);
    return state;
  }

  async removePlayer(pin: string, playerId: string): Promise<RoomState | null> {
    const state = await this.getRoomState(pin);
    if (!state) return null;

    delete state.players[playerId];
    await this.setRoomState(pin, state);
    return state;
  }

  async updatePlayer(
    pin: string,
    playerId: string,
    updates: Partial<Player>,
  ): Promise<RoomState | null> {
    const state = await this.getRoomState(pin);
    if (!state || !state.players[playerId]) return null;

    state.players[playerId] = {
      ...state.players[playerId],
      ...updates,
    };
    await this.setRoomState(pin, state);
    return state;
  }

  async updateRoomStatus(
    pin: string,
    status: 'waiting' | 'playing' | 'finished',
  ): Promise<RoomState | null> {
    const state = await this.getRoomState(pin);
    if (!state) return null;

    state.status = status;
    if (status === 'playing' && !state.startedAt) {
      state.startedAt = new Date();
    }
    if (status === 'finished' && !state.endedAt) {
      state.endedAt = new Date();
    }

    await this.setRoomState(pin, state);
    return state;
  }

  async nextQuestion(pin: string): Promise<RoomState | null> {
    const state = await this.getRoomState(pin);
    if (!state) return null;

    state.currentQuestionIndex += 1;
    state.currentQuestionStartedAt = new Date();
    await this.setRoomState(pin, state);
    return state;
  }
}

export const roomStateService = new RoomStateService();
