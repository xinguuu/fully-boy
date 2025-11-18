import { redis } from '../config/redis';

/**
 * Participant Session Data
 * Stored in Redis for session recovery after disconnect/refresh
 */
export interface ParticipantSession {
  participantId: string;
  pin: string;
  nickname: string;
  score: number;
  answers: Record<number, {
    answer: unknown;
    isCorrect: boolean;
    points: number;
    responseTimeMs: number;
    submittedAt: Date;
  }>;
  currentQuestionIndex: number;
  joinedAt: Date;
  lastActiveAt: Date;
}

/**
 * Participant Session Service
 * Manages participant sessions in Redis for recovery after disconnect/refresh
 */
export class ParticipantSessionService {
  private readonly SESSION_PREFIX = 'participant:session:';
  private readonly SESSION_TTL = 21600; // 6 hours in seconds

  /**
   * Get Redis key for participant session
   */
  private getSessionKey(participantId: string): string {
    return `${this.SESSION_PREFIX}${participantId}`;
  }

  /**
   * Get participant session by ID
   */
  async getSession(participantId: string): Promise<ParticipantSession | null> {
    const data = await redis.get(this.getSessionKey(participantId));
    if (!data) return null;

    const session = JSON.parse(data);
    // Convert date strings back to Date objects
    session.joinedAt = new Date(session.joinedAt);
    session.lastActiveAt = new Date(session.lastActiveAt);
    if (session.answers) {
      Object.keys(session.answers).forEach((key) => {
        session.answers[key].submittedAt = new Date(session.answers[key].submittedAt);
      });
    }

    return session;
  }

  /**
   * Create new participant session
   */
  async createSession(
    participantId: string,
    pin: string,
    nickname: string
  ): Promise<ParticipantSession> {
    const session: ParticipantSession = {
      participantId,
      pin,
      nickname,
      score: 0,
      answers: {},
      currentQuestionIndex: -1,
      joinedAt: new Date(),
      lastActiveAt: new Date(),
    };

    await redis.setex(
      this.getSessionKey(participantId),
      this.SESSION_TTL,
      JSON.stringify(session)
    );

    return session;
  }

  /**
   * Update participant session
   */
  async updateSession(
    participantId: string,
    updates: Partial<ParticipantSession>
  ): Promise<ParticipantSession | null> {
    const session = await this.getSession(participantId);
    if (!session) return null;

    const updatedSession = {
      ...session,
      ...updates,
      lastActiveAt: new Date(),
    };

    await redis.setex(
      this.getSessionKey(participantId),
      this.SESSION_TTL,
      JSON.stringify(updatedSession)
    );

    return updatedSession;
  }

  /**
   * Update participant score
   */
  async updateScore(participantId: string, newScore: number): Promise<ParticipantSession | null> {
    return this.updateSession(participantId, { score: newScore });
  }

  /**
   * Add answer to participant session
   */
  async addAnswer(
    participantId: string,
    questionIndex: number,
    answer: unknown,
    isCorrect: boolean,
    points: number,
    responseTimeMs: number
  ): Promise<ParticipantSession | null> {
    const session = await this.getSession(participantId);
    if (!session) return null;

    session.answers[questionIndex] = {
      answer,
      isCorrect,
      points,
      responseTimeMs,
      submittedAt: new Date(),
    };

    session.score += points;
    session.currentQuestionIndex = questionIndex;

    await redis.setex(
      this.getSessionKey(participantId),
      this.SESSION_TTL,
      JSON.stringify(session)
    );

    return session;
  }

  /**
   * Update current question index
   */
  async updateQuestionIndex(
    participantId: string,
    questionIndex: number
  ): Promise<ParticipantSession | null> {
    return this.updateSession(participantId, { currentQuestionIndex: questionIndex });
  }

  /**
   * Delete participant session
   */
  async deleteSession(participantId: string): Promise<void> {
    await redis.del(this.getSessionKey(participantId));
  }

  /**
   * Validate if session exists and is valid for the given room
   */
  async validateSession(participantId: string, pin: string): Promise<{
    isValid: boolean;
    session: ParticipantSession | null;
  }> {
    const session = await this.getSession(participantId);

    if (!session) {
      return { isValid: false, session: null };
    }

    if (session.pin !== pin) {
      return { isValid: false, session: null };
    }

    return { isValid: true, session };
  }

  /**
   * Refresh session TTL (keep alive)
   */
  async refreshSession(participantId: string): Promise<boolean> {
    const session = await this.getSession(participantId);
    if (!session) return false;

    session.lastActiveAt = new Date();

    await redis.setex(
      this.getSessionKey(participantId),
      this.SESSION_TTL,
      JSON.stringify(session)
    );

    return true;
  }
}

export const participantSessionService = new ParticipantSessionService();
