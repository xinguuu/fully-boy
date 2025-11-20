import type { ReactNode } from 'react';
import type { QuestionData } from '@xingu/shared';

/**
 * Participant View Props
 */
export interface ParticipantViewProps {
  questionData: QuestionData;
  questionIndex: number;
  totalQuestions: number;
  duration: number;
  currentQuestionStartedAt?: Date | string;
  hasAnswered: boolean;
  questionEnded: boolean;
  currentScore: number;
  currentRank?: number;

  // State for different answer types
  selectedAnswer: string | null;
  shortAnswerInput: string;

  // Callbacks
  onAnswerSelect: (answer: string) => void;
  onShortAnswerChange: (value: string) => void;
  onShortAnswerSubmit: (e: React.FormEvent) => void;

  // Answer result (if answered)
  lastAnswer?: {
    answer: unknown;
    isCorrect: boolean;
    points: number;
  };
}

/**
 * Organizer View Props
 */
export interface OrganizerViewProps {
  questionData: QuestionData;
  questionIndex: number;
  totalQuestions: number;
  duration: number;
  currentQuestionStartedAt?: Date | string;

  // Room state
  participants: Array<{
    id: string;
    nickname: string;
    score: number;
    hasAnswered: boolean;
    answer?: unknown;
    isCorrect?: boolean;
  }>;

  // Answer statistics
  answerStats?: Record<string, number>; // answer -> count

  // Current leaderboard
  leaderboard: Array<{
    rank: number;
    playerId: string;
    nickname: string;
    score: number;
  }>;
}

/**
 * Frontend Game Type Plugin
 *
 * Renders UI components for different game types
 */
export interface FrontendGameTypePlugin {
  /**
   * Unique identifier (must match backend plugin type)
   */
  readonly type: string;

  /**
   * Human-readable name
   */
  readonly name: string;

  /**
   * Render participant view (mobile/player screen)
   */
  renderParticipantView(props: ParticipantViewProps): ReactNode;

  /**
   * Render organizer view (host/presenter screen)
   */
  renderOrganizerView(props: OrganizerViewProps): ReactNode;

  /**
   * Render edit view (question editor) - optional
   */
  renderEditView?(props: {
    questionData: QuestionData;
    onChange: (data: QuestionData) => void;
  }): ReactNode;
}
