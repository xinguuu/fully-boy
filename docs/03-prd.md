# 📋 Product Requirements Document (PRD)

## 📌 Document Info

**Product Name**: Xingu - Korean Party Game Platform
**Version**: 1.0 (MVP)
**Last Updated**: 2025-11-11
**Status**: Draft
**Owner**: Development Team

---

## 1. Executive Summary

### 1.1 Product Vision

Xingu is a Korean-style party game platform that combines Kahoot's convenience with trending Korean entertainment content. It provides **game frameworks** (templates) that organizers can customize in 5 minutes, eliminating the need to build games from scratch.

### 1.2 Key Value Propositions

1. **⚡ Fast Setup**: 5 minutes vs 30 minutes (compared to creating from scratch)
2. **🔥 Trendy Content**: Korean entertainment shows, SNS trends, memes
3. **🎮 Flexible Participation**: Mobile-required mode + MC mode (phone-free)
4. **✏️ Easy Customization**: Modify only questions/content, framework is ready

### 1.3 Success Criteria

- MVP launch within 4 weeks
- 1 fully functional game (OX Quiz)
- Complete authentication and real-time features
- Successful test with 50+ participants
- <3 second response time for game actions

---

## 2. Problem Statement

### 2.1 Current Problems

**For Organizers:**
- Creating party games from scratch takes 30+ minutes
- Lack of Korean-specific game templates
- Need to constantly search for trending game ideas
- Kahoot is education-focused, not party-optimized

**For Participants:**
- Many games require phone participation even for simple games
- Missing out on trending Korean entertainment games
- Limited customization in existing platforms

### 2.2 Solution

Xingu provides **ready-to-use game frameworks** with:
- Pre-built game mechanics (only modify content)
- Korean entertainment/meme templates
- Flexible participation modes (mobile-required/not-required)
- 5-minute setup time

---

## 3. Target Users & Personas

### 3.1 Primary Persona: Event Organizer (진행자)

**Profile:**
- Age: 20-35
- Role: MT organizer, party host, event planner
- Tech-savvy: Medium to High
- Pain Points: Limited time, need quick setup, want trending content

**Goals:**
- Prepare party games in <5 minutes
- Find trending Korean games easily
- Run smooth, professional events
- Get participants engaged quickly

**Scenario:**
> "I'm organizing a company MT for 30 people tomorrow. I need 2-3 ice-breaking games that are trendy and easy to run. I don't have time to create games from scratch."

### 3.2 Secondary Persona: Participant (참여자)

**Profile:**
- Age: 20-40
- Role: MT participant, party attendee
- Tech-savvy: Low to Medium
- Pain Points: App installation friction, complex UIs

**Goals:**
- Join games quickly (no app install)
- Simple, clear UI on mobile
- Fun, engaging content
- See results in real-time

**Scenario:**
> "I got a PIN code from the organizer. I want to join the game quickly from my phone's browser without installing any app."

---

## 4. User Stories

### 4.1 Authentication (Auth Service)

**US-001: User Registration**
```
AS AN organizer
I WANT TO create an account with email and password
SO THAT I can create and manage my games
```

**Acceptance Criteria:**
- Email validation (valid format, unique)
- Password validation (min 8 chars, 1 uppercase, 1 number, 1 special char)
- Password hashing with bcrypt (10 salt rounds)
- Account created in PostgreSQL via Prisma
- Returns JWT access token (15min) + refresh token (7d)
- Refresh token stored in Redis

**US-002: User Login**
```
AS AN organizer
I WANT TO log in with my credentials
SO THAT I can access my saved games
```

**Acceptance Criteria:**
- Email + password validation
- bcrypt password comparison
- JWT access token issued (15min expiry)
- Refresh token issued (7d expiry, stored in Redis)
- Session created and shared across services
- Failed login returns 401 Unauthorized

**US-003: Token Refresh**
```
AS AN authenticated organizer
I WANT TO refresh my access token automatically
SO THAT I can continue using the platform without re-login
```

**Acceptance Criteria:**
- Valid refresh token required
- New access token issued (15min)
- Old refresh token invalidated
- New refresh token issued and stored
- Invalid/expired refresh tokens return 401

**US-004: User Logout**
```
AS AN authenticated organizer
I WANT TO log out of my account
SO THAT my session is terminated securely
```

**Acceptance Criteria:**
- Refresh token removed from Redis
- Access token invalidated
- Session destroyed
- Returns 200 OK

---

### 4.2 Game Library (Game Service)

**US-005: Browse Game Templates**
```
AS AN organizer
I WANT TO browse available game templates with filters
SO THAT I can find the right game for my event
```

**Acceptance Criteria:**
- Display all public game templates
- Filter by:
  - Mobile requirement (required/not-required/all)
  - Category (ice-breaking, quiz, music, etc.)
  - Duration (5/10/30/60 min)
  - Player count (5-10, 10-30, 30+)
- Sort by popularity, newest, name
- Show favorite (starred) games at top
- Each card displays:
  - Game title, description, thumbnail
  - Mobile requirement badge
  - Estimated duration, player count
  - Rating and play count
  - [Create Room] button, [Preview] button

**US-006: Preview Game Template**
```
AS AN organizer
I WANT TO preview a game template
SO THAT I can understand the game before using it
```

**Acceptance Criteria:**
- Modal shows:
  - Full game description
  - Sample questions/content
  - Rules and scoring system
  - Mobile requirement details
  - Video/GIF demo (if available)
- [Create Room] button in modal
- Close modal without navigation

**US-007: Add to Favorites (Star)**
```
AS AN organizer
I WANT TO bookmark favorite games
SO THAT I can quickly access them later
```

**Acceptance Criteria:**
- Click star icon (☆) to add to favorites
- Auto-creates a copy in "My Games"
- Star becomes filled (⭐)
- Toast notification: "Added to favorites"
- Click again to remove from favorites
- Favorites shown at top of "Browse" and "My Games"

---

### 4.3 Game Customization (Game Service)

**US-008: Edit Game Template**
```
AS AN organizer
I WANT TO edit game content (questions, images, settings)
SO THAT I can customize it for my event
```

**Acceptance Criteria:**
- Edit screen shows:
  - Game title (editable)
  - Game settings (time limits, sound effects, scoring)
  - Question list (add, edit, delete, reorder)
- Drag & drop to reorder questions
- Add/remove questions
- Edit question text and options
- Upload images (jpg, png, gif)
- Insert YouTube videos
- Upload audio files (mp3)
- [Save and Create Room] button
- [Cancel] button

**US-009: Create Room from Template**
```
AS AN organizer
I WANT TO create a game room with customized content
SO THAT participants can join and play
```

**Acceptance Criteria:**
- After editing, click [Save and Create Room]
- Game saved to "My Games"
- 6-digit PIN generated (unique)
- QR code generated for PIN
- Room created in PostgreSQL
- Room status: "waiting"
- Redirect to PIN display screen
- Display PIN, QR code, and join instructions

**US-010: My Games Management**
```
AS AN organizer
I WANT TO view and manage my saved games
SO THAT I can reuse them for future events
```

**Acceptance Criteria:**
- "My Games" tab shows all user's games
- Filter by favorites only
- Sort by: last played, modified date, name
- Each card shows:
  - Game title, type
  - Question count
  - Last played/modified timestamp
  - [Create Room] button (direct, no edit)
  - [Edit] button
  - [Delete] button
- Delete confirmation modal
- Play count tracking

---

### 4.4 Room & Lobby (Game Service + WS Service)

**US-011: Display Room PIN**
```
AS AN organizer
I WANT TO see the room PIN and QR code
SO THAT participants can join
```

**Acceptance Criteria:**
- Large 6-digit PIN displayed
- [Copy PIN] button
- QR code displayed
- Join instructions: "Go to xingu.com and enter PIN"
- Real-time participant list (0 initially)
- [Full Screen] button (presentation mode)
- [Start Game] button (enabled when ≥1 participant)

**US-012: Participant Join Room**
```
AS A participant
I WANT TO join a game room with PIN
SO THAT I can participate in the game
```

**Acceptance Criteria:**
- Home page has PIN input field (6 digits)
- QR code scanner option
- Enter PIN → nickname setup page
- Nickname validation (1-20 chars, no profanity)
- Enter nickname → join room via WebSocket
- Enter lobby/waiting room
- See other participants joining in real-time

**US-013: Waiting Room**
```
AS AN organizer
I WANT TO see participants joining in real-time
SO THAT I know when to start the game
```

**Acceptance Criteria:**
- Real-time participant list updates via WebSocket
- Show participant count
- Show participant nicknames with checkmarks (✅)
- [Start Game] button becomes enabled when ≥1 participant
- Click [Start Game] → game begins for all participants

---

### 4.5 Game Play (WS Service)

**US-014: Play OX Quiz (MVP Game)**
```
AS A participant
I WANT TO answer OX questions in real-time
SO THAT I can compete with others
```

**Acceptance Criteria:**
- Organizer screen shows:
  - Question number (Q 1/10)
  - Question text
  - O/X options with images
  - Response stats (real-time)
  - Timer (if enabled)
  - [Reveal Answer] button
- Participant screen shows:
  - Question text
  - Large [O] and [X] buttons
  - Timer countdown (if enabled)
  - "Waiting for others..." after submission
- Submit answer → disable buttons
- Real-time response count on organizer screen
- Organizer clicks [Reveal Answer] → show correct answer

**US-015: Answer Reveal & Scoring**
```
AS AN organizer
I WANT TO reveal answers and update scores
SO THAT participants can see results
```

**Acceptance Criteria:**
- Correct answer highlighted (✅)
- Wrong answer marked (❌)
- Response statistics displayed (% per option)
- TOP 5 leaderboard shown
- Score changes displayed (+100, +0)
- [Next Question] button
- Click [Next] → next question loads for all

**US-016: Game End & Results**
```
AS AN organizer
I WANT TO see final results when game ends
SO THAT I can announce winners
```

**Acceptance Criteria:**
- After last question, auto-navigate to results screen
- Display:
  - 🏆 Final Rankings (1st 🥇, 2nd 🥈, 3rd 🥉)
  - All participant scores
  - Game statistics:
    - Total participants
    - Average score
    - Total duration
    - Hardest question (lowest accuracy)
- Actions:
  - [Share Results] button
  - [Download PDF] button (Pro plan)
  - [Play Again] button (new room, same game)
  - [Back to My Games] button

---

### 4.6 Non-Functional Requirements

**US-017: Real-time Synchronization**
```
AS A system
I WANT TO synchronize game state across all clients in real-time
SO THAT all participants see the same game state
```

**Acceptance Criteria:**
- <100ms latency for WebSocket events
- Redis Pub/Sub for horizontal scaling
- Auto-reconnection on disconnect
- State recovery on reconnect
- Handle 100 concurrent rooms
- Handle 50 participants per room

**US-018: Data Validation**
```
AS A system
I WANT TO validate all user inputs with Zod
SO THAT invalid data is rejected
```

**Acceptance Criteria:**
- All API requests validated with Zod schemas
- Validation errors return 400 with detailed messages
- Type-safe validation across services
- Shared Zod schemas in `@xingu/shared`

**US-019: Error Handling**
```
AS A system
I WANT TO handle errors gracefully
SO THAT users see friendly error messages
```

**Acceptance Criteria:**
- Custom error classes (AppError, AuthError, ValidationError)
- User-friendly error messages (no technical details)
- Error logging (dev: console, prod: Sentry)
- 4xx errors for client mistakes
- 5xx errors for server issues
- Error boundaries in React

---

## 5. Functional Requirements

### 5.1 Authentication System

**FR-001: User Registration**
- Email + password registration
- Email format validation
- Password strength validation (min 8 chars, 1 uppercase, 1 number, 1 special)
- Unique email constraint
- bcrypt password hashing (10 salt rounds)
- JWT access token (15min expiry)
- Refresh token (7d expiry, stored in Redis)
- User record created in PostgreSQL

**FR-002: User Login**
- Email + password authentication
- bcrypt password comparison
- JWT access token issuance
- Refresh token issuance (stored in Redis)
- Session creation (shared across services)
- Failed login lockout (5 attempts, 15min cooldown)

**FR-003: Token Management**
- JWT access token validation middleware
- Refresh token endpoint
- Token rotation (new refresh token on refresh)
- Token revocation on logout
- Redis session store (TTL 7 days)

**FR-004: Authorization**
- Role-based access control (RBAC): Organizer, Admin
- JWT contains: userId, email, role
- Protected routes require valid access token
- Admin-only routes (future: user management, analytics)

---

### 5.2 Game Template System

**FR-005: Game Template CRUD**
- Public templates (read-only for organizers)
- User games (full CRUD by owner)
- Game types: OX Quiz (MVP), Balance Game, Initial Quiz (Phase 2)
- Template fields:
  - Title, description, thumbnail
  - Category, duration, player count
  - Mobile requirement (boolean)
  - Questions array (content varies by game type)
  - Settings (time limits, scoring, effects)

**FR-006: Game Filtering & Sorting**
- Filter by:
  - Mobile requirement (required/not-required/all)
  - Category (ice-breaking, quiz, music, vote, entertainment, meme)
  - Duration (5, 10, 30, 60 min)
  - Player count (5-10, 10-30, 30+)
- Sort by:
  - Popularity (play count, rating)
  - Newest (created date)
  - Name (alphabetical)

**FR-007: Favorites (Starring)**
- Star/unstar game templates
- Starred games create copy in "My Games"
- Favorites shown at top of Browse and My Games
- Star count tracked for popularity

**FR-008: Game Customization**
- Edit game title, description
- Add/edit/delete questions
- Drag & drop reorder questions
- Upload media (images, audio, video URLs)
- Configure game settings:
  - Time limit per question (5-60s or unlimited)
  - Scoring rules (points per correct answer)
  - Sound effects (on/off)
  - Background theme (basic/pro)

---

### 5.3 Room Management

**FR-009: Room Creation**
- Generate unique 6-digit PIN (numeric only)
- Generate QR code (PIN embedded)
- Room fields:
  - PIN (unique, indexed)
  - Game ID (reference to game template)
  - Organizer ID (user who created room)
  - Status (waiting, playing, finished)
  - Created at, started at, ended at
- Room expiration: 4 hours after creation (auto-cleanup)

**FR-010: Room State Management**
- Status transitions: waiting → playing → finished
- Current question index
- Participant list (nicknames, scores, connection status)
- Answer submissions per question
- Real-time state stored in Redis
- State synchronized via WebSocket

**FR-011: Participant Management**
- Join room with PIN
- Set nickname (unique per room)
- Connection tracking (online/offline)
- Auto-remove on disconnect (30s timeout)
- Kick participant (organizer only)

---

### 5.4 Game Play Logic

**FR-012: OX Quiz (MVP)**
- Question structure:
  - Question text
  - Correct answer (O or X)
  - Optional: image, explanation
- Participant answer submission
- Answer validation (O or X)
- Scoring: +100 points for correct, 0 for wrong
- Time bonus (if time limit enabled): +10 points per second remaining
- Real-time response tracking
- Answer reveal by organizer
- Leaderboard update after each question

**FR-013: Real-time Events (WebSocket)**
- `join-room`: Participant joins room (PIN + nickname)
- `participant-joined`: Broadcast to all (new participant info)
- `participant-left`: Broadcast to all (participant disconnect)
- `start-game`: Organizer starts game
- `question-start`: New question sent to all participants
- `submit-answer`: Participant submits answer (O/X)
- `answer-submitted`: Broadcast to organizer (response count)
- `reveal-answer`: Organizer reveals correct answer
- `answer-revealed`: Broadcast results and scores
- `next-question`: Organizer moves to next question
- `game-end`: Final results sent to all

**FR-014: Game Results**
- Final leaderboard (all participants ranked)
- Game statistics:
  - Total participants
  - Average score
  - Total duration (HH:MM:SS)
  - Hardest question (lowest accuracy)
  - Easiest question (highest accuracy)
- Results stored in PostgreSQL (GameResult table)
- Share results (copy link, social media)
- Download PDF (Pro plan only)

---

### 5.5 Data Persistence

**FR-015: Game History**
- Store completed games (GameResult)
- Organizer can view past games
- Participant list and scores saved
- Statistics saved for analytics
- Replay not supported (MVP)

**FR-016: Play Count & Ratings**
- Track play count per game template
- Track star count (favorites)
- Future: user ratings (1-5 stars)

---

## 6. Non-Functional Requirements

### 6.1 Performance

**NFR-001: Response Time**
- API response time: <200ms (p95)
- WebSocket event latency: <100ms (p95)
- Page load time: <3s (p95)
- Time to Interactive (TTI): <5s

**NFR-002: Scalability**
- Support 100 concurrent rooms
- Support 50 participants per room (5000 concurrent users)
- Horizontal scaling via Docker + Kubernetes (production)
- Redis Pub/Sub for WebSocket horizontal scaling

**NFR-003: Availability**
- 99% uptime (MVP)
- Auto-restart on crash (Docker restart policy)
- Health checks for all services
- Graceful degradation (WebSocket fallback to polling)

---

### 6.2 Security

**NFR-004: Authentication & Authorization**
- JWT-based authentication
- Short-lived access tokens (15min)
- Long-lived refresh tokens (7d, revocable)
- bcrypt password hashing (10 salt rounds)
- Rate limiting:
  - Auth endpoints: 5 req/min per IP
  - API endpoints: 100 req/min per user
  - WebSocket connections: 10 per user

**NFR-005: Data Security**
- SQL injection prevention (Prisma parameterized queries)
- XSS prevention (React auto-escaping, CSP headers)
- CSRF protection (SameSite cookies, CSRF tokens)
- HTTPS only (SSL/TLS via Nginx)
- Environment variables for secrets
- Docker secrets for production

**NFR-006: Input Validation**
- All inputs validated with Zod
- Request body validation
- Query parameter validation
- File upload validation (size, type)
- Profanity filter for nicknames (future)

---

### 6.3 Reliability

**NFR-007: Error Handling**
- Custom error classes (AppError, AuthError, ValidationError, NotFoundError)
- User-friendly error messages
- Error logging (dev: console, prod: Sentry)
- Retry logic for network failures
- Circuit breaker for external services (future)

**NFR-008: Data Integrity**
- Database constraints (unique, foreign keys, not null)
- Transaction support (Prisma)
- Referential integrity (cascade delete)
- Backup strategy (daily PostgreSQL backups)

---

### 6.4 Usability

**NFR-009: Accessibility**
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader support (ARIA labels)
- Color contrast ratio ≥4.5:1
- Focus indicators

**NFR-010: Responsive Design**
- Mobile-first design
- Responsive breakpoints: 640px (mobile), 768px (tablet), 1024px (desktop)
- Touch-friendly buttons (min 44x44px)
- Viewport meta tags

**NFR-011: Browser Compatibility**
- Chrome 90+
- Safari 14+
- Firefox 90+
- Edge 90+
- Mobile Safari (iOS 14+)
- Mobile Chrome (Android 10+)

---

### 6.5 Maintainability

**NFR-012: Code Quality**
- TypeScript strict mode
- ESLint + Prettier
- No `any` types (use `unknown`)
- SOLID principles
- Max file size: 500 lines

**NFR-013: Testing**
- Unit test coverage: ≥80%
- Integration tests for all API endpoints
- E2E tests for critical flows
- WebSocket event tests

**NFR-014: Documentation**
- API documentation (OpenAPI/Swagger)
- README for each service
- Inline comments for complex logic
- Architecture diagrams

---

## 7. Database Schema Design

### 7.1 Prisma Schema

```prisma
// packages/database/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ========================================
// User & Authentication
// ========================================

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  name          String?
  role          Role     @default(ORGANIZER)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  games         Game[]
  rooms         Room[]
  favorites     Favorite[]

  @@index([email])
  @@map("users")
}

enum Role {
  ORGANIZER
  ADMIN
}

// Refresh tokens stored in Redis (not in DB)
// Format: refresh_token:{tokenId} -> { userId, expiresAt }

// ========================================
// Game Templates
// ========================================

model Game {
  id              String      @id @default(cuid())
  title           String
  description     String?
  thumbnail       String?

  // Classification
  gameType        GameType
  category        Category
  isPublic        Boolean     @default(false) // Public templates vs user games

  // Metadata
  duration        Int         // Minutes
  minPlayers      Int         @default(5)
  maxPlayers      Int         @default(100)
  needsMobile     Boolean     // Mobile required?

  // Stats
  playCount       Int         @default(0)
  favoriteCount   Int         @default(0)

  // Settings
  settings        Json        // Game-specific settings (time limits, scoring)

  // Content
  questions       Question[]

  // Ownership
  userId          String?     // Null for public templates
  user            User?       @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relations
  rooms           Room[]
  favorites       Favorite[]

  @@index([gameType, isPublic])
  @@index([category, isPublic])
  @@index([userId])
  @@map("games")
}

enum GameType {
  OX_QUIZ           // MVP
  BALANCE_GAME      // Phase 2
  INITIAL_QUIZ      // Phase 2
  FOUR_CHOICE_QUIZ  // Phase 2
  SPEED_QUIZ        // Phase 3
}

enum Category {
  ICE_BREAKING
  QUIZ
  MUSIC
  VOTE
  ENTERTAINMENT
  MEME
}

// ========================================
// Questions
// ========================================

model Question {
  id          String   @id @default(cuid())
  gameId      String
  game        Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)

  order       Int      // Question order in game
  content     String   // Question text
  data        Json     // Question-specific data (varies by game type)

  // Media
  imageUrl    String?
  videoUrl    String?
  audioUrl    String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([gameId, order])
  @@map("questions")
}

// Question.data structure by GameType:
// OX_QUIZ:
// {
//   "correctAnswer": "O" | "X",
//   "explanation": "Optional explanation text"
// }
//
// BALANCE_GAME:
// {
//   "optionA": "Option A text",
//   "optionB": "Option B text"
// }
//
// FOUR_CHOICE_QUIZ:
// {
//   "options": ["A", "B", "C", "D"],
//   "correctAnswer": 0 | 1 | 2 | 3,
//   "explanation": "Optional explanation"
// }

// ========================================
// Favorites (Starring)
// ========================================

model Favorite {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  gameId    String
  game      Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@unique([userId, gameId])
  @@index([userId])
  @@map("favorites")
}

// ========================================
// Rooms & Game Sessions
// ========================================

model Room {
  id            String      @id @default(cuid())
  pin           String      @unique // 6-digit numeric PIN

  gameId        String
  game          Game        @relation(fields: [gameId], references: [id], onDelete: Cascade)

  organizerId   String
  organizer     User        @relation(fields: [organizerId], references: [id], onDelete: Cascade)

  status        RoomStatus  @default(WAITING)

  // Timestamps
  createdAt     DateTime    @default(now())
  startedAt     DateTime?
  endedAt       DateTime?
  expiresAt     DateTime    // Auto-cleanup after 4 hours

  // Relations
  result        GameResult?

  @@index([pin])
  @@index([organizerId])
  @@index([expiresAt]) // For cleanup job
  @@map("rooms")
}

enum RoomStatus {
  WAITING   // Participants joining
  PLAYING   // Game in progress
  FINISHED  // Game completed
}

// Room real-time state stored in Redis:
// room:{roomId} -> {
//   currentQuestionIndex: number,
//   participants: [{ nickname, score, online }],
//   answers: { [questionIndex]: { [nickname]: answer } }
// }

// ========================================
// Game Results
// ========================================

model GameResult {
  id              String   @id @default(cuid())
  roomId          String   @unique
  room            Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)

  // Statistics
  participantCount Int
  duration         Int      // Seconds
  averageScore     Float

  // Leaderboard (top 10)
  leaderboard      Json     // [{ nickname, score, rank }]

  // Question stats
  questionStats    Json     // [{ questionIndex, correctRate, avgTime }]

  createdAt        DateTime @default(now())

  @@index([roomId])
  @@map("game_results")
}
```

---

### 7.2 Redis Data Structures

**Session Store (Auth Service)**
```
Key: session:{userId}
Value: { accessToken, refreshToken, expiresAt }
TTL: 7 days
```

**Refresh Tokens**
```
Key: refresh_token:{tokenId}
Value: { userId, email, expiresAt }
TTL: 7 days
```

**Room State (WS Service)**
```
Key: room:{roomId}
Value: {
  pin: string,
  gameId: string,
  organizerId: string,
  status: "waiting" | "playing" | "finished",
  currentQuestionIndex: number,
  participants: [
    { nickname: string, socketId: string, score: number, online: boolean }
  ],
  answers: {
    [questionIndex]: {
      [nickname]: { answer: string, timestamp: number }
    }
  }
}
TTL: 4 hours
```

**Rate Limiting**
```
Key: rate_limit:auth:{ip}
Value: request count
TTL: 60 seconds

Key: rate_limit:api:{userId}
Value: request count
TTL: 60 seconds
```

---

### 7.3 Database Migrations Strategy

1. **Initial Migration**: Create all tables
2. **Seed Data**: Populate public game templates (OX Quiz examples)
3. **Indexes**: Add indexes for performance
4. **Constraints**: Foreign keys, unique constraints

**Prisma Commands:**
```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Apply migration (production)
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

---

## 8. API Specifications

### Service Architecture Overview (6 Microservices)

**Updated**: 2025-11-11 - Refactored from 3 services to 6 services for better separation of concerns

| Service | Port | Base URL | Purpose |
|---------|------|----------|---------|
| **Auth Service** | 3001 | `/api/auth` | User authentication, JWT management |
| **Template Service** | 3002 | `/api/templates` | Public game templates (read-only, cached) |
| **Game Service** | 3003 | `/api/games` | My games CRUD, customization |
| **Room Service** | 3004 | `/api/rooms` | Room creation, PIN management |
| **WS Service** | 3005 | `/ws` | Real-time gameplay (WebSocket) |
| **Result Service** | 3006 | `/api/results` | Game results, statistics, leaderboards |

---

### 8.1 Auth Service API (NestJS)

**Base URL**: `http://localhost:3001/api/auth` (dev)
**Production**: `https://xingu.com/api/auth` (via Nginx)

---

#### 8.1.1 POST /signup

**Description**: Register a new user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Validation (Zod):**
```typescript
{
  email: z.string().email(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[0-9]/, "Password must contain number")
    .regex(/[^A-Za-z0-9]/, "Password must contain special character"),
  name: z.string().min(1).max(100).optional()
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "ckl1j2k3l4m5n6o7p8q9",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "ORGANIZER",
    "createdAt": "2025-11-11T10:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- 400 Bad Request: Validation failed
- 409 Conflict: Email already exists

---

#### 8.1.2 POST /login

**Description**: Authenticate user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "ckl1j2k3l4m5n6o7p8q9",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "ORGANIZER"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- 400 Bad Request: Missing credentials
- 401 Unauthorized: Invalid credentials
- 429 Too Many Requests: Rate limit exceeded (5 attempts)

---

#### 8.1.3 POST /refresh

**Description**: Refresh access token

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // New refresh token
}
```

**Errors:**
- 401 Unauthorized: Invalid or expired refresh token

---

#### 8.1.4 POST /logout

**Description**: Logout user (invalidate tokens)

**Request Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

#### 8.1.5 GET /me

**Description**: Get current user info

**Request Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "id": "ckl1j2k3l4m5n6o7p8q9",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "ORGANIZER",
  "createdAt": "2025-11-11T10:00:00Z"
}
```

**Errors:**
- 401 Unauthorized: Invalid or expired access token

---

### 8.2 Template Service API (Express)

**Base URL**: `http://localhost:3002/api/templates` (dev)
**Production**: `https://xingu.com/api/templates` (via Nginx)

**Port**: 3002
**Authentication**: Optional (public templates, but favorite requires auth)
**Purpose**: Public game templates (read-only, heavy caching)

---

#### 8.2.1 GET /

**Description**: Get all public game templates with filters

**Query Parameters:**
```
?needsMobile=true|false|all  (default: all)
&category=ICE_BREAKING|QUIZ|MUSIC|VOTE|ENTERTAINMENT|MEME|all  (default: all)
&duration=5|10|30|60|all  (default: all)
&minPlayers=5|10|30|all  (default: all)
&sort=popularity|newest|name  (default: popularity)
&page=1  (default: 1)
&limit=20  (default: 20)
```

**Response (200 OK):**
```json
{
  "templates": [
    {
      "id": "ckl1j2k3l4m5n6o7p8q9",
      "title": "OX Quiz - General Knowledge",
      "description": "Test your general knowledge with O/X questions",
      "thumbnail": "https://cdn.xingu.com/templates/ox-quiz.jpg",
      "gameType": "OX_QUIZ",
      "category": "QUIZ",
      "duration": 10,
      "minPlayers": 5,
      "maxPlayers": 100,
      "needsMobile": true,
      "playCount": 1520,
      "favoriteCount": 342,
      "isFavorited": false,  // Based on current user
      "createdAt": "2025-11-01T10:00:00Z"
    },
    // ... more templates
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 24,
    "totalPages": 2
  }
}
```

---

#### 8.2.2 GET /:id

**Description**: Get single game template details

**Response (200 OK):**
```json
{
  "id": "ckl1j2k3l4m5n6o7p8q9",
  "title": "OX Quiz - General Knowledge",
  "description": "Test your general knowledge with O/X questions",
  "thumbnail": "https://cdn.xingu.com/templates/ox-quiz.jpg",
  "gameType": "OX_QUIZ",
  "category": "QUIZ",
  "duration": 10,
  "minPlayers": 5,
  "maxPlayers": 100,
  "needsMobile": true,
  "playCount": 1520,
  "favoriteCount": 342,
  "isFavorited": false,
  "settings": {
    "timeLimit": 30,  // seconds per question
    "pointsPerCorrect": 100,
    "timeBonusEnabled": true,
    "soundEnabled": true
  },
  "questions": [
    {
      "id": "q1",
      "order": 1,
      "content": "The Earth is flat.",
      "imageUrl": null,
      "videoUrl": null,
      "audioUrl": null,
      "data": {
        "correctAnswer": "X",
        "explanation": "The Earth is an oblate spheroid (round)."
      }
    },
    // ... more questions
  ],
  "createdAt": "2025-11-01T10:00:00Z",
  "updatedAt": "2025-11-05T15:30:00Z"
}
```

**Errors:**
- 404 Not Found: Template not found

---

#### 8.2.3 POST /templates/:id/favorite

**Description**: Add template to favorites (creates copy in My Games)

**Response (201 Created):**
```json
{
  "message": "Added to favorites",
  "game": {
    "id": "new-game-id",
    "title": "OX Quiz - General Knowledge (Copy)",
    "isFavorited": true,
    // ... full game object
  }
}
```

**Errors:**
- 404 Not Found: Template not found
- 409 Conflict: Already favorited

---

#### 8.2.4 DELETE /templates/:id/favorite

**Description**: Remove template from favorites

**Response (200 OK):**
```json
{
  "message": "Removed from favorites"
}
```

---

#### 8.2.5 GET /my-games

**Description**: Get current user's games

**Query Parameters:**
```
?favoritesOnly=true|false  (default: false)
&sort=lastPlayed|modified|name  (default: lastPlayed)
&page=1  (default: 1)
&limit=20  (default: 20)
```

**Response (200 OK):**
```json
{
  "games": [
    {
      "id": "user-game-id",
      "title": "Company MT Balance Game",
      "gameType": "BALANCE_GAME",
      "category": "ICE_BREAKING",
      "duration": 10,
      "needsMobile": false,
      "questionCount": 10,
      "playCount": 3,
      "isFavorited": true,
      "lastPlayedAt": "2025-11-10T14:30:00Z",
      "createdAt": "2025-11-01T10:00:00Z",
      "updatedAt": "2025-11-08T12:00:00Z"
    },
    // ... more games
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

---

#### 8.2.6 GET /my-games/:id

**Description**: Get user's game details (for editing)

**Response (200 OK):**
```json
{
  // Same structure as GET /templates/:id
  "id": "user-game-id",
  "title": "Company MT Balance Game",
  // ... full game object with questions
}
```

**Errors:**
- 403 Forbidden: Not the owner
- 404 Not Found: Game not found

---

#### 8.2.7 POST /my-games

**Description**: Create a new game from template or from scratch

**Request:**
```json
{
  "templateId": "ckl1j2k3l4m5n6o7p8q9",  // Optional: copy from template
  "title": "My Custom OX Quiz",
  "description": "Custom quiz for company event",
  "gameType": "OX_QUIZ",
  "category": "ICE_BREAKING",
  "duration": 15,
  "minPlayers": 10,
  "maxPlayers": 50,
  "needsMobile": true,
  "settings": {
    "timeLimit": 20,
    "pointsPerCorrect": 100,
    "timeBonusEnabled": false,
    "soundEnabled": true
  },
  "questions": [
    {
      "order": 1,
      "content": "Our company was founded in 2020.",
      "imageUrl": null,
      "data": {
        "correctAnswer": "O",
        "explanation": "Founded on Jan 1, 2020"
      }
    },
    // ... more questions
  ]
}
```

**Validation:**
```typescript
{
  templateId: z.string().cuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  gameType: z.enum(["OX_QUIZ", "BALANCE_GAME", ...]),
  category: z.enum(["ICE_BREAKING", "QUIZ", ...]),
  duration: z.number().int().min(5).max(120),
  minPlayers: z.number().int().min(1).max(1000),
  maxPlayers: z.number().int().min(1).max(1000),
  needsMobile: z.boolean(),
  settings: z.object({
    timeLimit: z.number().int().min(5).max(300).optional(),
    pointsPerCorrect: z.number().int().min(1).max(1000),
    timeBonusEnabled: z.boolean().optional(),
    soundEnabled: z.boolean().optional()
  }),
  questions: z.array(
    z.object({
      order: z.number().int().min(1),
      content: z.string().min(1).max(500),
      imageUrl: z.string().url().optional(),
      videoUrl: z.string().url().optional(),
      audioUrl: z.string().url().optional(),
      data: z.record(z.any()) // Game-type specific validation
    })
  ).min(1).max(100)
}
```

**Response (201 Created):**
```json
{
  "id": "new-game-id",
  "title": "My Custom OX Quiz",
  // ... full game object
  "createdAt": "2025-11-11T10:00:00Z"
}
```

**Errors:**
- 400 Bad Request: Validation failed
- 404 Not Found: Template not found (if templateId provided)

---

#### 8.2.8 PUT /my-games/:id

**Description**: Update user's game

**Request:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "settings": { /* updated settings */ },
  "questions": [ /* updated questions */ ]
}
```

**Response (200 OK):**
```json
{
  "id": "user-game-id",
  "title": "Updated Title",
  // ... full game object
  "updatedAt": "2025-11-11T11:00:00Z"
}
```

**Errors:**
- 400 Bad Request: Validation failed
- 403 Forbidden: Not the owner
- 404 Not Found: Game not found

---

#### 8.2.9 DELETE /my-games/:id

**Description**: Delete user's game

**Response (200 OK):**
```json
{
  "message": "Game deleted successfully"
}
```

**Errors:**
- 403 Forbidden: Not the owner
- 404 Not Found: Game not found

---

#### 8.2.10 POST /rooms

**Description**: Create a new room for a game

**Request:**
```json
{
  "gameId": "user-game-id"
}
```

**Validation:**
```typescript
{
  gameId: z.string().cuid()
}
```

**Response (201 Created):**
```json
{
  "room": {
    "id": "room-id",
    "pin": "123456",  // 6-digit unique PIN
    "gameId": "user-game-id",
    "organizerId": "current-user-id",
    "status": "WAITING",
    "createdAt": "2025-11-11T10:00:00Z",
    "expiresAt": "2025-11-11T14:00:00Z"  // 4 hours later
  },
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..." // QR code image (base64)
}
```

**Errors:**
- 400 Bad Request: Invalid gameId
- 403 Forbidden: Not the game owner
- 404 Not Found: Game not found

---

#### 8.2.11 GET /rooms/:pin

**Description**: Get room details by PIN (for participants joining)

**Response (200 OK):**
```json
{
  "room": {
    "id": "room-id",
    "pin": "123456",
    "status": "WAITING",
    "game": {
      "id": "game-id",
      "title": "Company MT Balance Game",
      "gameType": "BALANCE_GAME",
      "needsMobile": false
    },
    "organizerId": "organizer-id",
    "createdAt": "2025-11-11T10:00:00Z"
  }
}
```

**Errors:**
- 404 Not Found: Room not found or expired

---

#### 8.2.12 GET /rooms/:id/result

**Description**: Get game result for a finished room

**Response (200 OK):**
```json
{
  "result": {
    "id": "result-id",
    "roomId": "room-id",
    "participantCount": 30,
    "duration": 620,  // seconds
    "averageScore": 650,
    "leaderboard": [
      { "nickname": "John", "score": 950, "rank": 1 },
      { "nickname": "Jane", "score": 920, "rank": 2 },
      // ... top 10
    ],
    "questionStats": [
      {
        "questionIndex": 0,
        "question": "Question text",
        "correctRate": 0.85,  // 85% correct
        "avgTime": 12.5  // seconds
      },
      // ... all questions
    ],
    "createdAt": "2025-11-11T11:00:00Z"
  }
}
```

**Errors:**
- 404 Not Found: Room or result not found
- 400 Bad Request: Room not finished yet

---

### 8.3 WebSocket Service API (Socket.io)

**URL**: `ws://localhost:3003` (dev)
**Production**: `wss://xingu.com/ws` (via Nginx upgrade)

**Transport**: WebSocket (fallback: long-polling)

---

#### 8.3.1 Connection

**Client connects:**
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3003', {
  auth: {
    token: accessToken  // JWT access token (optional for participants)
  },
  transports: ['websocket', 'polling']
});
```

**Server authenticates:**
- Organizer: Requires valid JWT access token
- Participant: No authentication required

---

#### 8.3.2 Events (Client → Server)

**join-room**

Participant joins a room

```javascript
socket.emit('join-room', {
  pin: '123456',
  nickname: 'John Doe'
});
```

**Validation:**
```typescript
{
  pin: z.string().length(6).regex(/^\d{6}$/),
  nickname: z.string().min(1).max(20).trim()
}
```

**Response:**
```javascript
socket.on('joined-room', (data) => {
  console.log(data);
  // {
  //   roomId: 'room-id',
  //   nickname: 'John Doe',
  //   participants: [
  //     { nickname: 'Jane', online: true },
  //     { nickname: 'John Doe', online: true }
  //   ]
  // }
});
```

**Errors:**
```javascript
socket.on('error', (error) => {
  console.error(error);
  // { message: 'Room not found', code: 'ROOM_NOT_FOUND' }
  // { message: 'Nickname already taken', code: 'DUPLICATE_NICKNAME' }
  // { message: 'Room is already playing', code: 'ROOM_IN_PROGRESS' }
});
```

---

**start-game**

Organizer starts the game

```javascript
socket.emit('start-game', {
  roomId: 'room-id'
});
```

**Server broadcasts to all participants:**
```javascript
socket.on('game-started', (data) => {
  // {
  //   roomId: 'room-id',
  //   firstQuestion: {
  //     index: 0,
  //     content: 'The Earth is flat.',
  //     imageUrl: null,
  //     timeLimit: 30
  //   }
  // }
});
```

**Errors:**
- `NOT_ORGANIZER`: Only organizer can start game
- `ROOM_NOT_FOUND`: Room does not exist
- `NO_PARTICIPANTS`: Need at least 1 participant

---

**submit-answer**

Participant submits answer

```javascript
socket.emit('submit-answer', {
  roomId: 'room-id',
  questionIndex: 0,
  answer: 'O'  // OX Quiz: 'O' or 'X'
});
```

**Validation:**
```typescript
{
  roomId: z.string().cuid(),
  questionIndex: z.number().int().min(0),
  answer: z.string()  // Validated based on game type
}
```

**Server broadcasts to organizer:**
```javascript
// Organizer receives real-time response count
socket.on('answer-submitted', (data) => {
  // {
  //   roomId: 'room-id',
  //   questionIndex: 0,
  //   responseCount: 15,
  //   totalParticipants: 20,
  //   waitingFor: ['Jane', 'Bob', 'Alice']  // Nicknames who haven't answered
  // }
});
```

**Participant receives confirmation:**
```javascript
socket.on('answer-received', () => {
  // Show "Waiting for others..." message
});
```

**Errors:**
- `ALREADY_ANSWERED`: Participant already answered this question
- `INVALID_ANSWER`: Answer format invalid for game type
- `TIME_EXPIRED`: Time limit exceeded

---

**reveal-answer**

Organizer reveals correct answer

```javascript
socket.emit('reveal-answer', {
  roomId: 'room-id',
  questionIndex: 0
});
```

**Server broadcasts to all:**
```javascript
socket.on('answer-revealed', (data) => {
  // {
  //   roomId: 'room-id',
  //   questionIndex: 0,
  //   correctAnswer: 'X',
  //   explanation: 'The Earth is an oblate spheroid.',
  //   statistics: {
  //     'O': 8,  // 8 participants chose O
  //     'X': 12  // 12 participants chose X
  //   },
  //   leaderboard: [
  //     { nickname: 'John', score: 200, change: +100 },
  //     { nickname: 'Jane', score: 100, change: +100 },
  //     // ... top 5
  //   ]
  // }
});
```

---

**next-question**

Organizer moves to next question

```javascript
socket.emit('next-question', {
  roomId: 'room-id'
});
```

**Server broadcasts to all:**
```javascript
socket.on('question-started', (data) => {
  // {
  //   roomId: 'room-id',
  //   question: {
  //     index: 1,
  //     content: 'Next question text',
  //     imageUrl: null,
  //     timeLimit: 30
  //   }
  // }
});
```

**If last question:**
```javascript
socket.on('game-ended', (data) => {
  // {
  //   roomId: 'room-id',
  //   result: {
  //     leaderboard: [ /* all participants ranked */ ],
  //     statistics: {
  //       participantCount: 20,
  //       averageScore: 650,
  //       duration: 620,  // seconds
  //       hardestQuestion: { index: 4, correctRate: 0.25 },
  //       easiestQuestion: { index: 1, correctRate: 0.95 }
  //     }
  //   }
  // }
});
```

---

#### 8.3.3 Events (Server → Client)

**participant-joined**

Broadcast when a new participant joins

```javascript
socket.on('participant-joined', (data) => {
  // {
  //   roomId: 'room-id',
  //   participant: { nickname: 'Bob', online: true },
  //   totalCount: 3
  // }
});
```

---

**participant-left**

Broadcast when a participant disconnects

```javascript
socket.on('participant-left', (data) => {
  // {
  //   roomId: 'room-id',
  //   nickname: 'Bob',
  //   totalCount: 2
  // }
});
```

---

**timer-tick**

Optional: Server-side timer countdown

```javascript
socket.on('timer-tick', (data) => {
  // {
  //   roomId: 'room-id',
  //   questionIndex: 0,
  //   timeRemaining: 15  // seconds
  // }
});
```

---

#### 8.3.4 Error Handling

**All errors follow this format:**
```javascript
socket.on('error', (error) => {
  console.error(error);
  // {
  //   message: 'Human-readable error message',
  //   code: 'ERROR_CODE',
  //   details: { /* optional additional info */ }
  // }
});
```

**Common error codes:**
- `ROOM_NOT_FOUND`: Room does not exist or expired
- `DUPLICATE_NICKNAME`: Nickname already taken in this room
- `NOT_ORGANIZER`: Action requires organizer role
- `ROOM_IN_PROGRESS`: Cannot join, game already started
- `INVALID_STATE`: Action not allowed in current room state
- `VALIDATION_ERROR`: Input validation failed

---

#### 8.3.5 Reconnection

**Client reconnects:**
```javascript
socket.on('reconnect', () => {
  // Rejoin room
  socket.emit('rejoin-room', {
    roomId: 'room-id',
    nickname: 'John Doe'
  });
});

socket.on('rejoined-room', (data) => {
  // {
  //   roomId: 'room-id',
  //   currentState: {
  //     status: 'playing',
  //     currentQuestionIndex: 2,
  //     yourScore: 200,
  //     leaderboard: [ /* current rankings */ ]
  //   }
  // }
});
```

---

## 9. Security Requirements

### 9.1 Authentication Security

**SEC-001: Password Security**
- bcrypt hashing with 10 salt rounds
- Minimum password requirements enforced
- No password storage in plaintext or logs
- Failed login attempt tracking (5 attempts → 15min lockout)

**SEC-002: Token Security**
- JWT access tokens: 15min expiry (short-lived)
- Refresh tokens: 7d expiry (long-lived, revocable)
- Token rotation on refresh (old refresh token invalidated)
- Secure random token generation
- Tokens stored in HttpOnly cookies (production)

**SEC-003: Session Management**
- Redis-based session store
- Session timeout: 7 days
- Logout invalidates all tokens
- Concurrent session limit: 5 per user

---

### 9.2 API Security

**SEC-004: Rate Limiting**
- Auth endpoints: 5 req/min per IP
- API endpoints: 100 req/min per user
- WebSocket connections: 10 per user
- 429 Too Many Requests response
- Redis-based rate limit storage

**SEC-005: Input Validation**
- All inputs validated with Zod schemas
- Request body, query params, headers validated
- File upload validation (size, type, extension)
- SQL injection prevention (Prisma parameterized queries)
- XSS prevention (React auto-escaping, CSP headers)

**SEC-006: CORS Configuration**
- Whitelist allowed origins
- Credentials support for cookies
- Preflight request handling
- Restricted HTTP methods

---

### 9.3 Infrastructure Security

**SEC-007: HTTPS Only**
- SSL/TLS via Nginx
- Let's Encrypt certificates (production)
- HTTP → HTTPS redirect
- HSTS header (Strict-Transport-Security)

**SEC-008: Security Headers**
```nginx
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

**SEC-009: Docker Security**
- Non-root user in containers
- Read-only file systems where possible
- Network isolation (internal network for services)
- Database not exposed externally (only services can access)
- Docker secrets for sensitive data (production)

---

### 9.4 Data Security

**SEC-010: Sensitive Data Protection**
- Environment variables for secrets (`.env` not committed)
- No hardcoded credentials in code
- No sensitive data in logs
- Redact passwords/tokens in error messages

**SEC-011: Authorization**
- RBAC: Organizer, Admin roles
- Resource ownership checks (user can only edit own games)
- JWT contains userId, role
- Protected routes require valid access token

---

## 10. Success Metrics & KPIs

### 10.1 Product Metrics

**User Acquisition:**
- New user signups: Target 100 in first month
- Signup conversion rate: Target 20% (visitors → signups)
- Retention rate (D7): Target 40%
- Retention rate (D30): Target 20%

**Engagement:**
- Games created per user: Target 3+ per month
- Rooms created per user: Target 5+ per month
- Average participants per room: Target 15+
- Game completion rate: Target 85%+
- Customization usage rate: Target 60%+ users edit templates

**Growth:**
- Monthly Active Users (MAU): Target 500 in first 3 months
- Organic referrals: Target 30% of new users
- Social shares: Target 20% of completed games
- Star/favorite rate: Target 40% of played games

---

### 10.2 Technical Metrics

**Performance:**
- API response time: <200ms (p95)
- WebSocket latency: <100ms (p95)
- Page load time: <3s (p95)
- Time to Interactive (TTI): <5s

**Reliability:**
- Uptime: 99%+
- Error rate: <1% of requests
- WebSocket connection success rate: >95%
- Room creation success rate: >99%

**Scalability:**
- Concurrent rooms: 100+
- Concurrent users: 5000+
- Database query time: <50ms (p95)
- Redis operation time: <10ms (p95)

---

### 10.3 Business Metrics (Future)

**Monetization (Phase 3+):**
- Pro plan conversion rate: Target 5% of active users
- Monthly Recurring Revenue (MRR): Target $10,000 after 6 months
- Average Revenue Per User (ARPU): Target $5/month
- Churn rate: Target <5% per month

---

## 11. MVP Scope & Timeline

### 11.1 MVP Definition (Phase 1)

**Goal**: Launch a working product with 1 fully functional game (OX Quiz) in 2 weeks

**In Scope:**
- ✅ User authentication (signup, login, logout, token refresh)
- ✅ Browse public game templates (OX Quiz only)
- ✅ Favorite (star) templates
- ✅ Edit game content (questions, settings)
- ✅ Create room (PIN + QR code)
- ✅ Participant join room (PIN entry, nickname)
- ✅ Waiting room (real-time participant list)
- ✅ Play OX Quiz game (real-time answers, scoring, leaderboard)
- ✅ Game results (final rankings, statistics)
- ✅ My Games management (view, edit, delete)
- ✅ Responsive design (mobile & desktop)
- ✅ Basic error handling & validation

**Out of Scope (Phase 2+):**
- ❌ Additional game types (Balance Game, Initial Quiz, etc.)
- ❌ Advanced filters (detailed category, player count)
- ❌ Game history & replay
- ❌ Social features (comments, ratings)
- ❌ Pro plan features (branding, custom themes)
- ❌ Payment integration
- ❌ Social login (Google, Kakao)
- ❌ Mobile app
- ❌ Admin dashboard
- ❌ Analytics & monitoring (Sentry, analytics)

---

### 11.2 Timeline (2 Weeks)

#### **Week 1: Infrastructure & Backend (Days 1-7)**

**Day 1-2: Infrastructure Setup**
- [ ] Initialize Turborepo monorepo
- [ ] Set up Docker Compose (7 containers)
- [ ] Configure Nginx reverse proxy
- [ ] Set up PostgreSQL + Redis containers
- [ ] Create shared packages structure
- [ ] Design initial Prisma schema
- [ ] Configure environment variables
- [ ] Write initial migrations

**Day 3-4: Auth Service (NestJS)**
- [ ] Initialize NestJS project
- [ ] Implement POST /signup endpoint
- [ ] Implement POST /login endpoint
- [ ] Implement POST /logout endpoint
- [ ] Implement POST /refresh endpoint
- [ ] Implement GET /me endpoint
- [ ] JWT + Redis session management
- [ ] Zod validation schemas
- [ ] Unit tests (Jest)
- [ ] Integration tests

**Day 5: Game Service - Part 1 (Express)**
- [ ] Initialize Express project
- [ ] Implement GET /templates endpoint
- [ ] Implement GET /templates/:id endpoint
- [ ] Implement POST /templates/:id/favorite endpoint
- [ ] Seed database with 3 OX Quiz templates
- [ ] Zod validation schemas
- [ ] Unit tests

**Day 6-7: Game Service - Part 2 + WS Service**
- [ ] Game Service:
  - [ ] Implement GET /my-games endpoint
  - [ ] Implement POST /my-games endpoint
  - [ ] Implement PUT /my-games/:id endpoint
  - [ ] Implement DELETE /my-games/:id endpoint
  - [ ] Implement POST /rooms endpoint
  - [ ] Implement GET /rooms/:pin endpoint
  - [ ] Unit tests
- [ ] WebSocket Service:
  - [ ] Initialize Socket.io project
  - [ ] Redis Pub/Sub setup
  - [ ] Implement join-room event
  - [ ] Implement start-game event
  - [ ] Implement submit-answer event
  - [ ] Implement reveal-answer event
  - [ ] Implement next-question event
  - [ ] Real-time state management (Redis)
  - [ ] Unit tests

---

#### **Week 2: Frontend & Integration (Days 8-14)**

**Day 8-9: Frontend Core Pages**
- [ ] Initialize Next.js 15 project (App Router)
- [ ] Set up Tailwind CSS + Shadcn UI
- [ ] Implement authentication pages:
  - [ ] Home page (PIN entry)
  - [ ] Signup page
  - [ ] Login page
- [ ] Implement main pages:
  - [ ] Browse templates page (with filters)
  - [ ] My Games page
  - [ ] Edit game page
- [ ] Auth context (Zustand)
- [ ] API client (Axios + TanStack Query)

**Day 10-11: Frontend Game Flow**
- [ ] Room creation flow:
  - [ ] PIN display page
  - [ ] QR code generation
  - [ ] Waiting room (organizer view)
- [ ] Participant flow:
  - [ ] Nickname setup page
  - [ ] Waiting room (participant view)
- [ ] Game play pages:
  - [ ] Game screen (organizer view)
  - [ ] Game screen (participant view)
  - [ ] Answer reveal screen
  - [ ] Final results screen
- [ ] Socket.io client integration
- [ ] Real-time state management (Zustand + Socket.io)

**Day 12: Testing & Bug Fixes**
- [ ] E2E tests (Playwright):
  - [ ] Full organizer flow: signup → create game → create room → play → results
  - [ ] Full participant flow: join room → play → see results
  - [ ] Real-time sync test (multiple participants)
- [ ] Fix critical bugs
- [ ] Cross-browser testing
- [ ] Mobile responsive testing

**Day 13: Polish & Documentation**
- [ ] UI polish (loading states, error messages, animations)
- [ ] Error handling improvements
- [ ] Accessibility improvements (a11y)
- [ ] Update README files
- [ ] API documentation (OpenAPI)
- [ ] Deployment guide
- [ ] User guide (basic)

**Day 14: Deployment & Launch**
- [ ] Production environment setup
- [ ] Deploy to cloud (AWS/GCP/Vercel)
- [ ] SSL certificate setup
- [ ] Database migration (production)
- [ ] Seed production data (3 OX Quiz templates)
- [ ] Smoke tests on production
- [ ] Monitor logs and errors
- [ ] Internal testing with 10+ people
- [ ] 🚀 **MVP LAUNCH**

---

### 11.3 Phase 2 Scope (Weeks 3-4)

**Goal**: Add 2 more game types and enhanced features

**Features:**
- ✅ Balance Game (mobile not required)
- ✅ Initial Quiz (mobile required)
- ✅ 4-Choice Quiz (mobile required)
- ✅ Advanced filters (detailed categories, player count, duration)
- ✅ Game history (past games, results)
- ✅ QR code scanning for participants
- ✅ Sound effects and animations
- ✅ Game preview modal (detailed info)

---

### 11.4 Phase 3 Scope (Weeks 5-8)

**Goal**: Monetization and premium features

**Features:**
- ✅ Pro plan (₩4,990/month):
  - Custom branding (logo, colors)
  - Background customization
  - Unlimited participants
  - Download PDF results
- ✅ Payment integration (Toss Payments)
- ✅ Social login (Google, Kakao)
- ✅ Game template sharing (community)
- ✅ User ratings & reviews
- ✅ Admin dashboard (analytics, user management)
- ✅ Monitoring & error tracking (Sentry)

---

## 12. Dependencies & Risks

### 12.1 Technical Dependencies

**Critical Dependencies:**
- Node.js 24+
- PostgreSQL 17+
- Redis (latest)
- Docker & Docker Compose
- Nginx

**External Services:**
- CDN for media files (Phase 2)
- Email service for notifications (Phase 2)
- Payment gateway (Toss Payments, Phase 3)
- Error tracking (Sentry, Phase 3)

---

### 12.2 Risks & Mitigation

**Risk 1: Real-time Sync Issues**
- **Impact**: High (breaks core gameplay)
- **Probability**: Medium
- **Mitigation**:
  - Extensive WebSocket testing
  - Fallback to long-polling
  - Redis Pub/Sub for horizontal scaling
  - Connection recovery on disconnect

**Risk 2: Scalability Bottlenecks**
- **Impact**: High (limits user growth)
- **Probability**: Low (MVP scale)
- **Mitigation**:
  - Design for horizontal scaling from start
  - Redis for session & state management
  - Database indexing
  - Load testing before launch

**Risk 3: Security Vulnerabilities**
- **Impact**: Critical (data breach, reputation damage)
- **Probability**: Low (with proper practices)
- **Mitigation**:
  - Follow security best practices (OWASP)
  - Input validation (Zod)
  - Rate limiting
  - Regular dependency updates
  - Security audit before production

**Risk 4: Timeline Delays**
- **Impact**: Medium (delayed launch)
- **Probability**: High (2-week timeline is tight)
- **Mitigation**:
  - Daily standups
  - Task breakdown & tracking (TODOs)
  - Cut non-essential features if needed
  - Focus on MVP scope only

**Risk 5: User Adoption**
- **Impact**: High (product failure)
- **Probability**: Medium (new product)
- **Mitigation**:
  - Solve real pain point (5min setup vs 30min)
  - Test with target users early
  - Iterate based on feedback
  - Marketing & community building

---

## 13. Acceptance Criteria

### 13.1 MVP Launch Checklist

**Functionality:**
- [ ] User can sign up, log in, log out
- [ ] User can browse OX Quiz templates
- [ ] User can star templates and see in My Games
- [ ] User can edit game content (questions, settings)
- [ ] User can create room and get PIN + QR code
- [ ] Participant can join room with PIN
- [ ] Real-time participant list updates in waiting room
- [ ] Organizer can start game when ≥1 participant
- [ ] Participant can answer O/X questions in real-time
- [ ] Organizer can reveal answers and see response stats
- [ ] Leaderboard updates after each question
- [ ] Game ends with final results and statistics
- [ ] User can view My Games, edit, delete
- [ ] All features work on mobile and desktop

**Performance:**
- [ ] API response time <200ms (p95)
- [ ] WebSocket latency <100ms (p95)
- [ ] Page load time <3s (p95)
- [ ] No critical bugs (P0)
- [ ] <5% error rate in production

**Security:**
- [ ] All endpoints require authentication (except public)
- [ ] Passwords hashed with bcrypt
- [ ] JWT tokens expire correctly
- [ ] Rate limiting works on auth endpoints
- [ ] HTTPS enabled in production
- [ ] Input validation prevents SQL injection, XSS

**Quality:**
- [ ] Unit test coverage ≥80%
- [ ] All E2E tests pass
- [ ] No console errors or warnings
- [ ] Accessible (keyboard navigation, ARIA labels)
- [ ] Works on Chrome, Safari, Firefox, Edge

**Documentation:**
- [ ] README updated with setup instructions
- [ ] API documentation complete
- [ ] User guide available
- [ ] Deployment guide written

---

### 13.2 Definition of Done (DoD)

A feature is "Done" when:
1. Code written and follows style guide
2. Unit tests written and passing
3. Integration tests written and passing (if applicable)
4. Code reviewed and approved
5. Documentation updated
6. Merged to main branch
7. Deployed to staging and tested
8. Product owner approved

---

## 14. Appendix

### 14.1 Glossary

- **Organizer**: User who creates and manages games, hosts game rooms
- **Participant**: User who joins game rooms and plays games
- **Template**: Pre-built public game that organizers can copy and customize
- **My Games**: Organizer's personal collection of games (copies of templates or created from scratch)
- **Room**: Game session with unique PIN, where participants join and play
- **PIN**: 6-digit numeric code for joining a room
- **Session**: Authenticated user session (stored in Redis)
- **Game Type**: Type of game mechanic (OX Quiz, Balance Game, etc.)
- **Category**: Content category (Ice-breaking, Quiz, Music, etc.)

---

### 14.2 References

- [01-overview.md](./01-overview.md) - Project Overview
- [02-ia.md](./02-ia.md) - Information Architecture
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Socket.io Docs](https://socket.io/docs/v4/)
- [NestJS Docs](https://docs.nestjs.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)

---

### 14.3 Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-11 | Dev Team | Initial PRD creation |

---

**END OF DOCUMENT**

**Next Steps:**
1. Review and approve this PRD
2. Begin Week 1 implementation (Infrastructure & Backend)
3. Daily standup and progress tracking
4. Update this document as requirements change
