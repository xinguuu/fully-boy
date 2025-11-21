# 🎮 Hybrid Game Structure - Implementation Plan

> **Xingu 플랫폼의 퀴즈 게임 + 파티 게임 하이브리드 구조**
>
> **작성일**: 2025-11-21
> **상태**: 설계 완료 (구현 대기)

---

## 📌 목차

- [개요](#개요)
- [현재 시스템 분석](#현재-시스템-분석)
- [하이브리드 구조 설계](#하이브리드-구조-설계)
- [기술 구현 계획](#기술-구현-계획)
- [UI/UX 설계](#uiux-설계)
- [데이터베이스 스키마](#데이터베이스-스키마)
- [구현 로드맵](#구현-로드맵)

---

## 📖 개요

### 목표

Xingu 플랫폼을 **퀴즈 게임**과 **파티 게임**을 모두 지원하는 하이브리드 구조로 확장합니다.

### 핵심 원칙

1. **기존 시스템 재활용** - 플러그인 시스템 100% 활용
2. **확장성 우선** - 새로운 게임 타입 추가 쉽게
3. **일관된 UX** - 게임 타입별 차이는 있지만 전체 플로우는 유사
4. **Zero 기술부채** - 임시 구현 없이 처음부터 올바르게

### 게임 분류

```
Xingu 플랫폼
│
├── 📝 퀴즈 게임 (템플릿 기반, Question-based)
│   ├── 일반 퀴즈 (multiple-choice, true-false, short-answer)
│   └── 특수 퀴즈 (balance, chosung, proverb 등)
│
└── 🎮 파티 게임 (세션 기반, Session-based)
    ├── 간단 템플릿 (liar-game, bomb-passing 등)
    └── 고정 룰 (mafia, role-play 등)
```

---

## 🔍 현재 시스템 분석

### ✅ 기존 플러그인 시스템 (완성)

**파일 위치:**
- `packages/shared/src/types/plugin.types.ts` - 플러그인 인터페이스
- `packages/shared/src/plugins/game-types/` - 백엔드 플러그인 구현
- `apps/web/src/lib/plugins/` - 프론트엔드 플러그인 구현

**현재 구현된 플러그인:**
1. `TrueFalsePlugin` - OX 퀴즈
2. `MultipleChoicePlugin` - 객관식 퀴즈
3. `ShortAnswerPlugin` - 주관식 퀴즈

**플러그인 인터페이스 (백엔드):**
```typescript
interface GameTypePlugin {
  readonly type: string;        // 'multiple-choice', 'true-false', etc.
  readonly name: string;         // 'Multiple Choice'

  checkAnswer(questionData, userAnswer): boolean;
  calculateScore(options): ScoreResult;
  validateQuestionData(data): boolean;
  getDefaultQuestionData(): QuestionData;
}
```

**플러그인 인터페이스 (프론트엔드):**
```typescript
interface FrontendGameTypePlugin {
  readonly type: string;
  readonly name: string;

  renderParticipantView(props): ReactNode;  // 참가자 화면
  renderOrganizerView(props): ReactNode;    // 진행자 화면
  renderEditView?(props): ReactNode;        // 편집 화면 (선택)
}
```

### ✅ 현재 데이터 구조

**Template 테이블:**
```prisma
model Template {
  id          String    @id @default(cuid())
  title       String
  description String?
  category    String
  tags        Tag[]
  questions   Question[] // 질문들
  createdBy   User
  // ...
}
```

**Question 테이블:**
```prisma
model Question {
  id          String    @id @default(cuid())
  text        String
  type        String    // 'multiple-choice', 'true-false', 'short-answer'
  data        Json      // 플러그인별 커스텀 데이터 (유연한 구조!)
  duration    Int       // 제한 시간 (초)
  // ...
}
```

**Game 테이블:**
```prisma
model Game {
  id          String     @id @default(cuid())
  templateId  String     // 템플릿 참조
  title       String
  questions   Question[] // 템플릿 질문의 복사본
  status      GameStatus
  // ...
}
```

### 💡 핵심 인사이트

**기존 시스템의 강점:**
1. ✅ **플러그인 시스템** - 새로운 게임 타입 추가 쉬움
2. ✅ **유연한 데이터 구조** - `Question.data: Json` (플러그인별 자유)
3. ✅ **프론트/백엔드 분리** - 각각 독립적인 플러그인
4. ✅ **템플릿 시스템** - 재사용 가능

**활용 전략:**
- 퀴즈 게임: 기존 `Question` 기반 플러그인 그대로
- 파티 게임: **새로운 플러그인 타입** 추가 (세션 기반)

---

## 🎯 하이브리드 구조 설계

### 게임 타입 분류

| 분류 | 설명 | 데이터 구조 | 예시 |
|------|------|------------|------|
| **퀴즈 게임** | 질문 기반, 템플릿 저장 | Question[] | K-POP 퀴즈, 밸런스 게임 |
| **파티 게임** | 세션 기반, 즉석 생성 | Session settings | 라이어 게임, 마피아 |

### 1. 퀴즈 게임 (Question-based)

**특징:**
- 질문 리스트 기반 (`Question[]`)
- 템플릿 저장/재사용 가능
- 편집 가능 (Edit 모달)
- 현재 시스템 그대로 활용

**플로우:**
```
Browse → Select Template → Edit (optional) → Create Game → Play
```

**플러그인 타입 (기존):**
- `multiple-choice` - 객관식
- `true-false` - OX
- `short-answer` - 주관식

**플러그인 타입 (추가 예정):**
- `balance-choice` - 밸런스 게임 (OX 확장)
- `chosung-quiz` - 초성 게임 (단답형 확장)
- `proverb-quiz` - 속담 게임 (단답형 확장)
- `music-quiz` - 음악 퀴즈 (미디어 + 단답형)

### 2. 파티 게임 (Session-based)

**특징:**
- 세션 설정 기반 (`settings: Json`)
- 템플릿 없이 즉석 생성
- 라운드/페이즈 시스템
- 실시간 상호작용 중심

**플로우:**
```
Browse → Select Party Game → Configure Settings → Start → Play
```

**플러그인 타입 (추가 예정):**
- `liar-game` - 라이어 게임
- `mafia-game` - 마피아 게임
- `bomb-passing` - 폭탄 돌리기
- `role-play` - 역할극 게임
- `balance-vote` - 밸런스 투표 (즉석)

**세션 데이터 구조 예시:**
```typescript
// 라이어 게임
interface LiarGameSettings {
  rounds: number;           // 라운드 수
  keywords: string[];       // 키워드 목록
  discussionTime: number;   // 토론 시간 (초)
  votingTime: number;       // 투표 시간 (초)
}

// 마피아 게임
interface MafiaGameSettings {
  roles: {
    mafia: number;
    doctor: number;
    police: number;
    citizen: number;
  };
  nightDuration: number;
  dayDuration: number;
}
```

---

## 🛠️ 기술 구현 계획

### Phase 1: 플러그인 인터페이스 확장

**목표:** 파티 게임을 지원하는 새로운 플러그인 타입 정의

#### 1.1. 플러그인 카테고리 추가

**파일:** `packages/shared/src/types/plugin.types.ts`

```typescript
/**
 * Plugin category
 */
export enum PluginCategory {
  QUIZ = 'quiz',       // Question-based games
  PARTY = 'party',     // Session-based games
}

/**
 * Base Game Type Plugin (extended)
 */
export interface GameTypePlugin {
  readonly type: string;
  readonly name: string;
  readonly category: PluginCategory; // 🆕 NEW

  // Quiz games (Question-based)
  checkAnswer?(questionData: QuestionData, userAnswer: unknown): boolean;
  calculateScore?(options: ScoreCalculationOptions): ScoreResult;
  validateQuestionData?(questionData: unknown): questionData is QuestionData;
  getDefaultQuestionData?(): QuestionData;

  // Party games (Session-based) 🆕 NEW
  validateSessionSettings?(settings: unknown): boolean;
  getDefaultSessionSettings?(): Record<string, unknown>;
  initializeSession?(settings: Record<string, unknown>): SessionState;
  processAction?(session: SessionState, action: GameAction): SessionState;
}

/**
 * Session state for party games
 */
export interface SessionState {
  round: number;
  phase: string;
  players: PlayerState[];
  data: Record<string, unknown>; // Game-specific data
}

/**
 * Player state in session
 */
export interface PlayerState {
  id: string;
  nickname: string;
  role?: string;        // Mafia, Liar, etc.
  status: 'active' | 'eliminated' | 'spectator';
  data?: Record<string, unknown>; // Player-specific data
}

/**
 * Game action (player input)
 */
export interface GameAction {
  type: string;         // 'vote', 'answer', 'role-action', etc.
  playerId: string;
  payload: unknown;
}
```

#### 1.2. 프론트엔드 플러그인 확장

**파일:** `apps/web/src/lib/plugins/types.ts`

```typescript
/**
 * Frontend Game Type Plugin (extended)
 */
export interface FrontendGameTypePlugin {
  readonly type: string;
  readonly name: string;
  readonly category: PluginCategory; // 🆕 NEW

  // Quiz games (Question-based)
  renderParticipantView?(props: ParticipantViewProps): ReactNode;
  renderOrganizerView?(props: OrganizerViewProps): ReactNode;
  renderEditView?(props: EditViewProps): ReactNode;

  // Party games (Session-based) 🆕 NEW
  renderSessionParticipantView?(props: SessionParticipantViewProps): ReactNode;
  renderSessionOrganizerView?(props: SessionOrganizerViewProps): ReactNode;
  renderSettingsView?(props: SettingsViewProps): ReactNode;
}

/**
 * Session Participant View Props (for party games)
 */
export interface SessionParticipantViewProps {
  sessionState: SessionState;
  myPlayer: PlayerState;

  // Callbacks
  onAction: (action: GameAction) => void;
}

/**
 * Session Organizer View Props (for party games)
 */
export interface SessionOrganizerViewProps {
  sessionState: SessionState;

  // Controls
  onNextPhase: () => void;
  onEndGame: () => void;
}

/**
 * Settings View Props (for party games)
 */
export interface SettingsViewProps {
  settings: Record<string, unknown>;
  onChange: (settings: Record<string, unknown>) => void;
}
```

### Phase 2: 데이터베이스 스키마 확장

**목표:** 파티 게임을 저장할 수 있도록 스키마 확장

#### 2.1. Template 스키마 확장

**파일:** `packages/database/prisma/schema.prisma`

```prisma
model Template {
  id          String   @id @default(cuid())
  title       String
  description String?
  category    String

  // 🆕 NEW: Game category
  gameCategory TemplateCategory @default(QUIZ)

  // Quiz games (Question-based)
  questions   Question[]

  // Party games (Session-based) 🆕 NEW
  sessionSettings Json?  // Party game settings

  tags        Tag[]
  createdBy   User     @relation(fields: [userId], references: [id])
  userId      String

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([category])
  @@index([gameCategory]) // 🆕 NEW
}

enum TemplateCategory {
  QUIZ   // Question-based games
  PARTY  // Session-based games
}
```

#### 2.2. Game 스키마 확장

```prisma
model Game {
  id          String      @id @default(cuid())
  templateId  String?     // Optional (party games may not have template)
  template    Template?   @relation(fields: [templateId], references: [id])

  title       String
  pin         String      @unique

  // 🆕 NEW: Game category
  gameCategory TemplateCategory @default(QUIZ)

  // Quiz games
  questions   Question[]

  // Party games 🆕 NEW
  sessionSettings Json?
  sessionState    Json?  // Current session state

  status      GameStatus
  createdBy   User       @relation(fields: [userId], references: [id])
  userId      String

  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([pin])
  @@index([gameCategory]) // 🆕 NEW
}
```

### Phase 3: Browse UI 개선

**목표:** 퀴즈/파티 게임을 구분하여 표시

#### 3.1. Browse 페이지 탭 추가

**파일:** `apps/web/src/app/(dashboard)/browse/page.tsx`

```typescript
// Tab state
const [activeTab, setActiveTab] = useState<'quiz' | 'party'>('quiz');

// Filter templates by category
const quizTemplates = templates.filter(t => t.gameCategory === 'QUIZ');
const partyTemplates = templates.filter(t => t.gameCategory === 'PARTY');

return (
  <div>
    {/* Tabs */}
    <div className="tabs">
      <button onClick={() => setActiveTab('quiz')}>
        📝 퀴즈 게임
      </button>
      <button onClick={() => setActiveTab('party')}>
        🎮 파티 게임
      </button>
    </div>

    {/* Content */}
    {activeTab === 'quiz' && (
      <QuizTemplateList templates={quizTemplates} />
    )}
    {activeTab === 'party' && (
      <PartyTemplateList templates={partyTemplates} />
    )}
  </div>
);
```

#### 3.2. 파티 게임 설정 모달

**파일:** `apps/web/src/components/PartyGameSettings.tsx`

```typescript
interface Props {
  template: Template;
  onStart: (settings: Record<string, unknown>) => void;
}

export function PartyGameSettings({ template, onStart }: Props) {
  const [settings, setSettings] = useState(template.sessionSettings || {});
  const plugin = useGamePlugin(template.type);

  return (
    <Modal>
      <h2>{template.title} 설정</h2>

      {/* Render plugin-specific settings UI */}
      {plugin?.renderSettingsView?.({
        settings,
        onChange: setSettings,
      })}

      <button onClick={() => onStart(settings)}>
        게임 시작
      </button>
    </Modal>
  );
}
```

### Phase 4: WebSocket 이벤트 확장

**목표:** 파티 게임의 실시간 상호작용 지원

#### 4.1. 새로운 WebSocket 이벤트

**파일:** `apps/ws-service/src/events/party-game.events.ts`

```typescript
// 파티 게임 전용 이벤트
export const PARTY_GAME_EVENTS = {
  // Session management
  SESSION_START: 'party:session:start',
  SESSION_UPDATE: 'party:session:update',
  SESSION_END: 'party:session:end',

  // Phase management
  PHASE_CHANGE: 'party:phase:change',

  // Player actions
  PLAYER_ACTION: 'party:player:action',
  PLAYER_ROLE_ASSIGN: 'party:player:role',

  // Voting
  VOTE_START: 'party:vote:start',
  VOTE_SUBMIT: 'party:vote:submit',
  VOTE_RESULT: 'party:vote:result',
};
```

#### 4.2. 파티 게임 핸들러

**파일:** `apps/ws-service/src/handlers/party-game.handler.ts`

```typescript
@WebSocketGateway()
export class PartyGameHandler {
  @SubscribeMessage(PARTY_GAME_EVENTS.SESSION_START)
  async handleSessionStart(
    @MessageBody() data: { gameId: string; settings: Record<string, unknown> },
  ) {
    const game = await this.gameService.findById(data.gameId);
    const plugin = this.pluginRegistry.get(game.type);

    // Initialize session using plugin
    const sessionState = plugin.initializeSession(data.settings);

    // Save session state
    await this.gameService.updateSessionState(data.gameId, sessionState);

    // Broadcast to all participants
    this.server.to(data.gameId).emit(PARTY_GAME_EVENTS.SESSION_UPDATE, {
      sessionState,
    });
  }

  @SubscribeMessage(PARTY_GAME_EVENTS.PLAYER_ACTION)
  async handlePlayerAction(
    @MessageBody() data: { gameId: string; action: GameAction },
  ) {
    const game = await this.gameService.findById(data.gameId);
    const plugin = this.pluginRegistry.get(game.type);

    // Process action using plugin
    const newState = plugin.processAction(game.sessionState, data.action);

    // Save new state
    await this.gameService.updateSessionState(data.gameId, newState);

    // Broadcast update
    this.server.to(data.gameId).emit(PARTY_GAME_EVENTS.SESSION_UPDATE, {
      sessionState: newState,
    });
  }
}
```

---

## 🎨 UI/UX 설계

### Browse 페이지

```
┌─────────────────────────────────────────────┐
│  Xingu                          [프로필]     │
├─────────────────────────────────────────────┤
│                                             │
│  [📝 퀴즈 게임]  [🎮 파티 게임]  [내 게임]  │  ← 탭
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  📝 퀴즈 게임 템플릿                         │
│  ┌────────┐ ┌────────┐ ┌────────┐          │
│  │ K-POP  │ │ 드라마 │ │밸런스  │          │
│  │  퀴즈  │ │  퀴즈  │ │ 게임   │          │
│  │  ⭐️4.8│ │  ⭐️4.5│ │  ⭐️4.9│          │
│  └────────┘ └────────┘ └────────┘          │
│                                             │
│  🎮 파티 게임                                │
│  ┌────────┐ ┌────────┐ ┌────────┐          │
│  │라이어  │ │ 마피아 │ │ 폭탄   │          │
│  │ 게임   │ │  게임  │ │돌리기  │          │
│  │4-10명  │ │6-20명  │ │4-12명  │          │
│  └────────┘ └────────┘ └────────┘          │
│                                             │
└─────────────────────────────────────────────┘
```

### 퀴즈 게임 플로우 (기존과 동일)

```
1. Browse → 템플릿 선택
2. Edit 모달 → 질문 수정 (선택)
3. Create Game → PIN 생성
4. Waiting Room → 참가자 대기
5. Live Game → 실시간 플레이
6. Results → 최종 결과
```

### 파티 게임 플로우 (새로운 플로우)

```
1. Browse → 파티 게임 선택
2. Settings 모달 → 게임 설정
   - 라운드 수
   - 시간 설정
   - 키워드/역할 선택 등
3. Create Game → PIN 생성
4. Waiting Room → 참가자 대기
5. Live Party Game → 실시간 플레이
   - 페이즈별 진행
   - 투표 시스템
   - 역할 배정 등
6. Results → 최종 결과
```

### 파티 게임 설정 모달 (예시 - 라이어 게임)

```
┌─────────────────────────────────────┐
│  라이어 게임 설정                    │
├─────────────────────────────────────┤
│                                     │
│  라운드 수                           │
│  [1] [2] [3] [4] [5]  ← 선택: 3     │
│                                     │
│  키워드 카테고리                     │
│  ☑ 음식                             │
│  ☑ 동물                             │
│  ☐ 영화                             │
│  ☑ K-POP                            │
│                                     │
│  토론 시간                           │
│  [30초] [60초] [90초] ← 선택: 60초   │
│                                     │
│  투표 시간                           │
│  [15초] [30초] [45초] ← 선택: 30초   │
│                                     │
│         [취소]  [게임 시작]          │
└─────────────────────────────────────┘
```

---

## 💾 데이터베이스 스키마

### Migration 계획

**파일:** `packages/database/prisma/migrations/YYYYMMDD_add_party_games.sql`

```sql
-- Add TemplateCategory enum
CREATE TYPE "TemplateCategory" AS ENUM ('QUIZ', 'PARTY');

-- Add gameCategory to Template
ALTER TABLE "Template"
ADD COLUMN "gameCategory" "TemplateCategory" NOT NULL DEFAULT 'QUIZ',
ADD COLUMN "sessionSettings" JSONB;

-- Add gameCategory to Game
ALTER TABLE "Game"
ADD COLUMN "gameCategory" "TemplateCategory" NOT NULL DEFAULT 'QUIZ',
ADD COLUMN "sessionSettings" JSONB,
ADD COLUMN "sessionState" JSONB;

-- Make templateId optional for party games
ALTER TABLE "Game"
ALTER COLUMN "templateId" DROP NOT NULL;

-- Add indexes
CREATE INDEX "Template_gameCategory_idx" ON "Template"("gameCategory");
CREATE INDEX "Game_gameCategory_idx" ON "Game"("gameCategory");
```

### 데이터 예시

**퀴즈 게임 템플릿:**
```json
{
  "id": "template_001",
  "title": "K-POP 퀴즈",
  "gameCategory": "QUIZ",
  "questions": [
    {
      "type": "multiple-choice",
      "text": "방탄소년단의 리더는?",
      "data": {
        "options": ["RM", "진", "슈가", "제이홉"],
        "correctAnswer": 0
      }
    }
  ],
  "sessionSettings": null
}
```

**파티 게임 템플릿:**
```json
{
  "id": "template_002",
  "title": "라이어 게임",
  "gameCategory": "PARTY",
  "questions": [],
  "sessionSettings": {
    "type": "liar-game",
    "defaultRounds": 3,
    "keywords": [
      { "category": "음식", "words": ["피자", "치킨", "햄버거"] },
      { "category": "동물", "words": ["강아지", "고양이", "토끼"] }
    ],
    "discussionTime": 60,
    "votingTime": 30
  }
}
```

**파티 게임 실행 중 상태:**
```json
{
  "id": "game_001",
  "gameCategory": "PARTY",
  "sessionSettings": {
    "rounds": 3,
    "selectedCategories": ["음식", "동물"],
    "discussionTime": 60,
    "votingTime": 30
  },
  "sessionState": {
    "round": 2,
    "phase": "discussion",
    "currentKeyword": "피자",
    "liarId": "player_003",
    "players": [
      {
        "id": "player_001",
        "nickname": "철수",
        "role": "citizen",
        "status": "active"
      },
      {
        "id": "player_002",
        "nickname": "영희",
        "role": "citizen",
        "status": "active"
      },
      {
        "id": "player_003",
        "nickname": "민수",
        "role": "liar",
        "status": "active"
      }
    ],
    "votes": {},
    "phaseStartedAt": "2025-11-21T10:30:00Z"
  }
}
```

---

## 🗺️ 구현 로드맵

### Phase 1: 인프라 구축 (1주)

**목표:** 파티 게임을 지원하는 기반 구조 구축

**작업:**
1. ✅ 플러그인 인터페이스 확장 (`PluginCategory` 추가)
2. ✅ 데이터베이스 스키마 확장 (`gameCategory`, `sessionSettings`)
3. ✅ Migration 작성 및 실행
4. ✅ Browse UI 탭 추가 (퀴즈/파티 구분)
5. ✅ 테스트 작성 (플러그인 카테고리 검증)

**검증:**
- `pnpm type-check` 통과
- `pnpm test` 통과 (새 테스트 포함)
- Browse 페이지에 탭 표시

---

### Phase 2: 첫 번째 파티 게임 (라이어 게임) (1주)

**목표:** 파일럿으로 라이어 게임 구현

**작업:**

#### 2.1. 백엔드 플러그인
- `packages/shared/src/plugins/party-games/liar-game.plugin.ts`
- 역할 배정 (라이어 1명, 나머지 시민)
- 세션 초기화
- 투표 처리 로직
- 최종 키워드 맞추기 로직

#### 2.2. 프론트엔드 플러그인
- `apps/web/src/lib/plugins/party-games/LiarGamePlugin.tsx`
- 설정 화면 (`renderSettingsView`)
- 참가자 화면 (`renderSessionParticipantView`)
  - 키워드 표시 (라이어는 "라이어")
  - 토론 단계
  - 투표 UI
  - 최종 키워드 입력 (라이어)
- 진행자 화면 (`renderSessionOrganizerView`)
  - 전체 상태 모니터링
  - 페이즈 전환 컨트롤

#### 2.3. WebSocket 핸들러
- `apps/ws-service/src/handlers/liar-game.handler.ts`
- 세션 시작
- 투표 제출/집계
- 최종 키워드 제출
- 결과 계산

#### 2.4. 템플릿 시드 데이터
- `packages/database/prisma/seed-party-games.ts`
- 라이어 게임 기본 템플릿
- 키워드 목록 (음식, 동물, 영화 등)

**검증:**
- 라이어 게임 전체 플로우 테스트
- 4~10명 참가자로 E2E 테스트 (Playwright)
- 투표 시스템 동작 확인
- 최종 키워드 맞추기 동작 확인

---

### Phase 3: 퀴즈 게임 확장 (1주)

**목표:** 기존 퀴즈 시스템에 새로운 플러그인 추가

**작업:**

#### 3.1. 밸런스 게임 플러그인
- `balance-choice` 플러그인
- OX 기반 (true-false 확장)
- 투표 결과 통계 표시
- 소수 의견자 강조

#### 3.2. 초성 게임 플러그인
- `chosung-quiz` 플러그인
- 단답형 기반 (short-answer 확장)
- 초성 자동 변환
- 힌트 단계별 공개

#### 3.3. 속담 게임 플러그인
- `proverb-quiz` 플러그인
- 단답형 기반
- 초성 힌트
- 뜻 해설 표시

**검증:**
- 각 플러그인별 테스트
- 기존 퀴즈 게임과 동일한 플로우 확인

---

### Phase 4: 추가 파티 게임 (2~3주)

**목표:** 다양한 파티 게임 추가

**우선순위:**

#### 4.1. 폭탄 돌리기 (중간 난이도)
- 순서 시스템
- 랜덤 타이머
- 중복 답변 체크

#### 4.2. 밸런스 투표 (쉬움)
- 즉석 투표 시스템
- 실시간 결과 그래프
- 소수 의견자 강조

#### 4.3. 역할극 게임 (중간 난이도)
- 랜덤 역할 배정
- 상황 시나리오
- 역할 맞추기 투표

#### 4.4. 마피아 게임 (고급)
- 복잡한 역할 시스템
- 낮/밤 페이즈
- 직업별 특수 능력

**검증:**
- 각 게임별 E2E 테스트
- 다양한 인원수로 테스트

---

### Phase 5: UI/UX 개선 (1주)

**목표:** 사용자 경험 최적화

**작업:**
1. Browse 페이지 필터링 개선
2. 게임 카드 디자인 개선 (인원수, 시간 표시)
3. 파티 게임 설정 모달 UX 개선
4. 로딩 애니메이션 추가
5. 에러 처리 개선

**검증:**
- Lighthouse 점수 유지 (>90)
- 접근성 테스트 (WCAG 2.1 AA)
- 모바일 반응형 테스트

---

### Phase 6: 테스트 & 문서화 (1주)

**목표:** 품질 보증 및 문서 완성

**작업:**

#### 6.1. 테스트
- 단위 테스트 (각 플러그인)
- 통합 테스트 (WebSocket 이벤트)
- E2E 테스트 (Playwright, 전체 플로우)
- 부하 테스트 (동시 접속 100명)

#### 6.2. 문서화
- [docs/03-prd.md](03-prd.md) 업데이트 (API 스펙)
- [docs/02-ia.md](02-ia.md) 업데이트 (UI 플로우)
- [docs/06-development-guide.md](06-development-guide.md) 업데이트 (Recent Changes)
- 플러그인 개발 가이드 작성

**검증:**
- 테스트 커버리지 >80%
- 모든 문서 최신화
- `pnpm type-check && pnpm lint && pnpm test && pnpm build` 통과

---

## 📋 체크리스트

### 설계 완료
- [x] 하이브리드 구조 설계
- [x] 플러그인 인터페이스 설계
- [x] 데이터베이스 스키마 설계
- [x] UI/UX 플로우 설계
- [x] WebSocket 이벤트 설계
- [x] 구현 로드맵 작성

### 구현 대기
- [ ] Phase 1: 인프라 구축
- [ ] Phase 2: 라이어 게임 구현
- [ ] Phase 3: 퀴즈 게임 확장
- [ ] Phase 4: 추가 파티 게임
- [ ] Phase 5: UI/UX 개선
- [ ] Phase 6: 테스트 & 문서화

---

## 🎯 다음 단계

1. **사용자 승인 대기** - 이 설계안 검토
2. **Phase 1 시작** - 인프라 구축 (플러그인 인터페이스 확장)
3. **라이어 게임 구현** - 파일럿 프로젝트

---

## 📚 관련 문서

- [docs/09-game-ideas.md](09-game-ideas.md) - 게임 아이디어 모음
- [docs/04-architecture.md](04-architecture.md) - 시스템 아키텍처
- [docs/03-prd.md](03-prd.md) - 제품 요구사항 (API 스펙)
- [CLAUDE.md](../CLAUDE.md) - 프로젝트 현황

---

**작성자**: Claude
**최종 수정**: 2025-11-21
