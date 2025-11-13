export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: '/api/auth/signup',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
  },
  GAMES: {
    TEMPLATES: '/api/games/templates',
    TEMPLATE_BY_ID: (id: string) => `/api/games/templates/${id}`,
    FAVORITE: (id: string) => `/api/games/templates/${id}/favorite`,
    MY_GAMES: '/api/games/my-games',
    MY_GAME_BY_ID: (id: string) => `/api/games/my-games/${id}`,
    ROOMS: '/api/games/rooms',
    ROOM_BY_PIN: (pin: string) => `/api/games/rooms/${pin}`,
    ROOM_RESULT: (id: string) => `/api/games/rooms/${id}/result`,
  },
} as const;

export * from './websocket';

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
  DUPLICATE_NICKNAME: 'DUPLICATE_NICKNAME',
  NOT_ORGANIZER: 'NOT_ORGANIZER',
  ROOM_IN_PROGRESS: 'ROOM_IN_PROGRESS',
  INVALID_STATE: 'INVALID_STATE',
  ALREADY_ANSWERED: 'ALREADY_ANSWERED',
  INVALID_ANSWER: 'INVALID_ANSWER',
  TIME_EXPIRED: 'TIME_EXPIRED',
  NO_PARTICIPANTS: 'NO_PARTICIPANTS',
} as const;

export const TOKEN_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  BCRYPT_SALT_ROUNDS: 10,
} as const;

export const RATE_LIMIT = {
  AUTH_ENDPOINTS: 5,
  API_ENDPOINTS: 100,
  WS_CONNECTIONS: 10,
  WINDOW_MS: 60000,
} as const;
