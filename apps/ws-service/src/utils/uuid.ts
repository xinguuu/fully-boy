import { randomUUID } from 'crypto';

/**
 * Generate a unique participant ID
 */
export function generateParticipantId(): string {
  return randomUUID();
}
