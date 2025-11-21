export const WS_EVENTS = {
  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  // Room events (client → server)
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',

  // Game control (organizer → server)
  START_GAME: 'start-game',
  NEXT_QUESTION: 'next-question',
  END_GAME: 'end-game',
  END_QUESTION: 'end-question',

  // Player actions (participant → server)
  SUBMIT_ANSWER: 'submit-answer',
  SYNC_STATE: 'sync-state',

  // Party game actions (participant → server)
  GAME_ACTION: 'game-action', // Generic action for party games
  NEXT_PHASE: 'next-phase', // Organizer advances to next phase

  // Server → client broadcasts
  JOINED_ROOM: 'joined-room', // To joiner
  PARTICIPANT_JOINED: 'participant-joined', // To others
  PARTICIPANT_LEFT: 'participant-left',
  SESSION_RESTORED: 'session-restored', // Session recovery confirmation
  GAME_STARTED: 'game-started',
  QUESTION_STARTED: 'question-started',
  ANSWER_RECEIVED: 'answer-received', // Confirmation to submitter
  ANSWER_SUBMITTED: 'answer-submitted', // Notification to others
  QUESTION_ENDED: 'question-ended', // Results + leaderboard
  GAME_ENDED: 'game-ended',
  STATE_SYNCED: 'state-synced',
  SESSION_UPDATED: 'session-updated', // Party game session state update
  ERROR: 'error',
} as const;

export type WsEvent = (typeof WS_EVENTS)[keyof typeof WS_EVENTS];
