export const SOUND_TYPES = {
  // Game flow sounds
  COUNTDOWN_TICK: 'countdown-tick',
  COUNTDOWN_END: 'countdown-end',
  QUESTION_START: 'question-start',

  // Answer sounds
  ANSWER_SUBMIT: 'answer-submit',
  ANSWER_CORRECT: 'answer-correct',
  ANSWER_WRONG: 'answer-wrong',

  // Streak sounds
  STREAK_2: 'streak-2',
  STREAK_3: 'streak-3',
  STREAK_5: 'streak-5',

  // Leaderboard sounds
  LEADERBOARD_REVEAL: 'leaderboard-reveal',
  RANK_UP: 'rank-up',

  // Game end sounds
  VICTORY: 'victory',
  GAME_END: 'game-end',
  PODIUM_REVEAL: 'podium-reveal',
} as const;

export type SoundType = (typeof SOUND_TYPES)[keyof typeof SOUND_TYPES];

export const SOUND_VOLUME: Record<string, number> = {
  MASTER: 0.7,
  EFFECTS: 0.8,
  MUSIC: 0.5,
};
