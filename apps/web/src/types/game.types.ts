/**
 * Frontend-specific game types
 *
 * This file contains UI/UX-specific types for the game flow.
 * Backend and shared types are imported from @xingu/shared.
 */

// ==========================================
// Re-export shared types for convenience
// ==========================================

export type {
  Game,
  Question,
  GameType,
  Category,
  TemplateCategory,
  CreateGameDto,
  UpdateGameDto,
  GameWithQuestions,
  QuestionInput,
  MultipleChoiceQuestionData,
  TrueFalseQuestionData,
  ShortAnswerQuestionData,
  AnyQuestionData,
} from '@xingu/shared';

// ==========================================
// Frontend-specific types (UI/Game Flow)
// ==========================================

/**
 * Game flow state types for Kahoot-style gameplay
 */
export type GamePhase =
  | 'QUESTION_INTRO' // Show "Question 1/10" for 2 seconds
  | 'ANSWERING' // Participants selecting answers
  | 'SUBMITTED' // Answer submitted, waiting for others
  | 'ANSWER_REVEAL' // Correct answer revealed
  | 'LEADERBOARD'; // Show current standings

export interface GameFlowState {
  phase: GamePhase;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  timeRemaining: number;
}

export const KAHOOT_COLORS = [
  { bg: 'bg-red-500', hover: 'hover:bg-red-600', text: 'text-red-500', label: '빨강' },
  { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', text: 'text-blue-500', label: '파랑' },
  {
    bg: 'bg-yellow-500',
    hover: 'hover:bg-yellow-600',
    text: 'text-yellow-500',
    label: '노랑',
  },
  { bg: 'bg-green-500', hover: 'hover:bg-green-600', text: 'text-green-500', label: '초록' },
] as const;

export const PHASE_DURATIONS = {
  QUESTION_INTRO: 2000, // 2 seconds
  ANSWER_REVEAL: 3000, // 3 seconds
  LEADERBOARD: 5000, // 5 seconds
} as const;
