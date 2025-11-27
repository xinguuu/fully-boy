import { GameType, Category, TemplateCategory } from '@xingu/shared';

export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'balance-game';

export interface GameTypeDefaults {
  gameType: GameType;
  category: Category;
  gameCategory: TemplateCategory;
  needsMobile: boolean;
  duration: number;
  minPlayers: number;
  maxPlayers: number;
  questionType: QuestionType;
}

export const GAME_TYPE_DEFAULTS: Record<GameType, GameTypeDefaults> = {
  [GameType.OX_QUIZ]: {
    gameType: GameType.OX_QUIZ,
    category: Category.QUIZ,
    gameCategory: TemplateCategory.QUIZ,
    needsMobile: true,
    duration: 10,
    minPlayers: 2,
    maxPlayers: 50,
    questionType: 'true-false',
  },
  [GameType.FOUR_CHOICE_QUIZ]: {
    gameType: GameType.FOUR_CHOICE_QUIZ,
    category: Category.QUIZ,
    gameCategory: TemplateCategory.QUIZ,
    needsMobile: true,
    duration: 15,
    minPlayers: 2,
    maxPlayers: 50,
    questionType: 'multiple-choice',
  },
  [GameType.BALANCE_GAME]: {
    gameType: GameType.BALANCE_GAME,
    category: Category.ENTERTAINMENT,
    gameCategory: TemplateCategory.PARTY,
    needsMobile: false,
    duration: 20,
    minPlayers: 2,
    maxPlayers: 100,
    questionType: 'balance-game',
  },
  [GameType.LIAR_GAME]: {
    gameType: GameType.LIAR_GAME,
    category: Category.ENTERTAINMENT,
    gameCategory: TemplateCategory.PARTY,
    needsMobile: false,
    duration: 30,
    minPlayers: 4,
    maxPlayers: 10,
    questionType: 'short-answer',
  },
  [GameType.INITIAL_QUIZ]: {
    gameType: GameType.INITIAL_QUIZ,
    category: Category.QUIZ,
    gameCategory: TemplateCategory.QUIZ,
    needsMobile: true,
    duration: 10,
    minPlayers: 2,
    maxPlayers: 50,
    questionType: 'short-answer',
  },
  [GameType.SPEED_QUIZ]: {
    gameType: GameType.SPEED_QUIZ,
    category: Category.QUIZ,
    gameCategory: TemplateCategory.QUIZ,
    needsMobile: true,
    duration: 10,
    minPlayers: 2,
    maxPlayers: 50,
    questionType: 'short-answer',
  },
};

export const GAME_TYPE_NAMES: Record<GameType, string> = {
  [GameType.OX_QUIZ]: 'OX 퀴즈',
  [GameType.FOUR_CHOICE_QUIZ]: '4지선다 퀴즈',
  [GameType.BALANCE_GAME]: '밸런스 게임',
  [GameType.LIAR_GAME]: '라이어 게임',
  [GameType.INITIAL_QUIZ]: '초성 퀴즈',
  [GameType.SPEED_QUIZ]: '스피드 퀴즈',
};
