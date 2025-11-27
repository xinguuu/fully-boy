import { GameType } from '@xingu/shared';

// GameType 한글 매핑
export function getGameTypeLabel(gameType: GameType): string {
  const labels: Record<GameType, string> = {
    [GameType.OX_QUIZ]: 'OX 퀴즈',
    [GameType.BALANCE_GAME]: '밸런스 게임',
    [GameType.INITIAL_QUIZ]: '초성 퀴즈',
    [GameType.FOUR_CHOICE_QUIZ]: '4지선다',
    [GameType.SPEED_QUIZ]: '스피드 퀴즈',
    [GameType.LIAR_GAME]: '라이어 게임',
  };
  return labels[gameType] || gameType;
}

// 게임 타입 카드 정보
export interface GameTypeInfo {
  type: GameType;
  name: string;
  description: string;
  emoji: string;
  isParty: boolean;
  gradient: string;
}

export const GAME_TYPE_CARDS: GameTypeInfo[] = [
  {
    type: GameType.OX_QUIZ,
    name: 'OX 퀴즈',
    description: 'O 또는 X로 답하는 간단한 퀴즈',
    emoji: '⭕',
    isParty: false,
    gradient: 'from-blue-400 to-blue-600',
  },
  {
    type: GameType.FOUR_CHOICE_QUIZ,
    name: '4지선다 퀴즈',
    description: '4개의 선택지 중 정답 맞추기',
    emoji: '📝',
    isParty: false,
    gradient: 'from-orange-400 to-red-500',
  },
  {
    type: GameType.BALANCE_GAME,
    name: '밸런스 게임',
    description: '둘 중 하나! 취향 선택 게임',
    emoji: '⚖️',
    isParty: true,
    gradient: 'from-purple-400 to-pink-500',
  },
  {
    type: GameType.LIAR_GAME,
    name: '라이어 게임',
    description: '라이어를 찾아라! 심리 추리 게임',
    emoji: '🤥',
    isParty: true,
    gradient: 'from-green-400 to-teal-500',
  },
  {
    type: GameType.INITIAL_QUIZ,
    name: '초성 퀴즈',
    description: '초성만 보고 단어 맞추기',
    emoji: '🔤',
    isParty: false,
    gradient: 'from-amber-400 to-yellow-500',
  },
  {
    type: GameType.SPEED_QUIZ,
    name: '스피드 퀴즈',
    description: '빠르게 단어 맞추기',
    emoji: '⚡',
    isParty: false,
    gradient: 'from-cyan-400 to-blue-500',
  },
];
