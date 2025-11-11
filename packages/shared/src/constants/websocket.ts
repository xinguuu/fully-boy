export const WS_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  START_GAME: 'start-game',
  NEXT_QUESTION: 'next-question',
  SUBMIT_ANSWER: 'submit-answer',
  SYNC_STATE: 'sync-state',
  END_GAME: 'end-game',
  PLAYER_JOINED: 'player-joined',
  PLAYER_LEFT: 'player-left',
  GAME_STARTED: 'game-started',
  QUESTION_STARTED: 'question-started',
  ANSWER_SUBMITTED: 'answer-submitted',
  QUESTION_ENDED: 'question-ended',
  GAME_ENDED: 'game-ended',
  STATE_SYNCED: 'state-synced',
  ERROR: 'error',
} as const;

export type WsEvent = (typeof WS_EVENTS)[keyof typeof WS_EVENTS];
