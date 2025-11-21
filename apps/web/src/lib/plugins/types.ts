import type { ReactNode } from 'react';
import type {
  QuestionData,
  PluginCategory,
  SessionState,
  PlayerState,
  GameAction,
} from '@xingu/shared';

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

  // Show results (answers revealed)
  showResults?: boolean;
}

/**
 * Session Participant View Props (for party games)
 */
export interface SessionParticipantViewProps {
  sessionState: SessionState;
  myPlayer: PlayerState;

  // Callbacks
  onAction: (action: Omit<GameAction, 'playerId' | 'timestamp'>) => void;
}

/**
 * Session Organizer View Props (for party games)
 */
export interface SessionOrganizerViewProps {
  sessionState: SessionState;

  // Controls
  onNextPhase?: () => void;
  onEndGame?: () => void;
}

/**
 * Settings View Props (for party games)
 */
export interface SettingsViewProps {
  settings: Record<string, unknown>;
  onChange: (settings: Record<string, unknown>) => void;
}

/**
 * Frontend Game Type Plugin
 *
 * Renders UI components for different game types
 *
 * Supports two categories:
 * - QUIZ (PluginCategory.QUIZ): Question-based games
 *   Required: renderParticipantView, renderOrganizerView
 *   Optional: renderEditView
 * - PARTY (PluginCategory.PARTY): Session-based games
 *   Required: renderSessionParticipantView, renderSessionOrganizerView, renderSettingsView
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
   * Plugin category (QUIZ or PARTY)
   */
  readonly category: PluginCategory;

  // ==========================================
  // QUIZ GAMES (Question-based) - Required for PluginCategory.QUIZ
  // ==========================================

  /**
   * Render participant view (mobile/player screen) - QUIZ games only
   */
  renderParticipantView?(props: ParticipantViewProps): ReactNode;

  /**
   * Render organizer view (host/presenter screen) - QUIZ games only
   */
  renderOrganizerView?(props: OrganizerViewProps): ReactNode;

  /**
   * Render edit view (question editor) - QUIZ games only (optional)
   */
  renderEditView?(props: {
    questionData: QuestionData;
    onChange: (data: QuestionData) => void;
  }): ReactNode;

  // ==========================================
  // PARTY GAMES (Session-based) - Required for PluginCategory.PARTY
  // ==========================================

  /**
   * Render session participant view - PARTY games only
   */
  renderSessionParticipantView?(
    props: SessionParticipantViewProps,
  ): ReactNode;

  /**
   * Render session organizer view - PARTY games only
   */
  renderSessionOrganizerView?(props: SessionOrganizerViewProps): ReactNode;

  /**
   * Render settings view (party game configuration) - PARTY games only
   */
  renderSettingsView?(props: SettingsViewProps): ReactNode;
}
