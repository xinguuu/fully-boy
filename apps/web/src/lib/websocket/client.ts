import { io, Socket } from 'socket.io-client';
import { WS_EVENTS } from '@xingu/shared';
import type { EventPayloads, EventResponses } from './types';
import { tokenManager } from '../auth/token-manager';

class WebSocketClient {
  private socket: Socket | null = null;
  private url: string;

  constructor() {
    this.url = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3005';
  }

  connect(pin?: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = tokenManager.getAccessToken();

    this.socket = io(this.url, {
      transports: ['websocket', 'polling'],
      auth: token ? { token } : undefined,
      query: pin ? { pin } : undefined,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('[WebSocket] Connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('[WebSocket] Disconnected manually');
    }
  }

  emit<E extends keyof EventPayloads>(
    event: E,
    payload: EventPayloads[E]
  ): void {
    if (!this.socket?.connected) {
      console.error('[WebSocket] Not connected. Cannot emit event:', event);
      return;
    }
    this.socket.emit(event, payload);
  }

  on<E extends keyof EventResponses>(
    event: E,
    callback: (data: EventResponses[E]) => void
  ): void {
    if (!this.socket) {
      console.error('[WebSocket] Socket not initialized');
      return;
    }
    this.socket.on(event as string, callback);
  }

  off<E extends keyof EventResponses>(
    event: E,
    callback?: (data: EventResponses[E]) => void
  ): void {
    if (!this.socket) {
      return;
    }
    if (callback) {
      this.socket.off(event as string, callback);
    } else {
      this.socket.off(event as string);
    }
  }

  joinRoom(pin: string, nickname?: string, participantId?: string): void {
    this.emit(WS_EVENTS.JOIN_ROOM, { pin, nickname, participantId });
  }

  startGame(pin: string): void {
    this.emit(WS_EVENTS.START_GAME, { pin });
  }

  nextQuestion(pin: string): void {
    this.emit(WS_EVENTS.NEXT_QUESTION, { pin });
  }

  submitAnswer(
    pin: string,
    questionIndex: number,
    answer: unknown,
    responseTimeMs: number
  ): void {
    this.emit(WS_EVENTS.SUBMIT_ANSWER, {
      pin,
      questionIndex,
      answer,
      responseTimeMs,
    });
  }

  endQuestion(pin: string, questionIndex: number): void {
    this.emit(WS_EVENTS.END_QUESTION, { pin, questionIndex });
  }

  endGame(pin: string): void {
    this.emit(WS_EVENTS.END_GAME, { pin });
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const wsClient = new WebSocketClient();
