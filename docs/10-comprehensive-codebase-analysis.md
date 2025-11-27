# Xingu 종합 코드베이스 분석 보고서

> **분석일**: 2025-11-27
> **분석 범위**: Frontend (Next.js 16) + 6 Backend Services (NestJS/Express) + Shared Packages
> **총 코드 라인**: ~25,000+ LOC (TypeScript)

---

## 📋 Executive Summary

### 전체 평가: **B+ (8.0/10)** - Production-Ready with Improvements Needed

| 영역 | 점수 | 상태 |
|------|------|------|
| **아키텍처** | 8.5/10 | ✅ 우수 - MSA 잘 설계됨 |
| **보안** | 7.0/10 | ⚠️ 주의 - Critical 이슈 3개 |
| **성능** | 7.5/10 | ⚠️ 개선 필요 |
| **코드 품질** | 8.0/10 | ✅ 양호 |
| **테스트** | 6.5/10 | ⚠️ 커버리지 부족 |
| **타입 안전성** | 9.0/10 | ✅ 우수 |

### 발견된 이슈 요약

| 우선순위 | 개수 | 예시 |
|----------|------|------|
| 🔴 **CRITICAL** | 8개 | 보안 취약점, 데이터 노출, 파일 크기 위반 |
| 🟠 **HIGH** | 15개 | 성능 최적화, 누락된 테스트, 타입 안전성 |
| 🟡 **MEDIUM** | 22개 | 코드 중복, 접근성, 에러 처리 |
| 🟢 **LOW** | 12개 | 문서화, 리팩토링, 코드 스타일 |

---

## 🏗️ Part 1: 아키텍처 분석

### 1.1 서비스별 현황

```
┌─────────────────────────────────────────────────────────────────┐
│                      XINGU ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐     ┌─────────────────────────────────────┐   │
│  │   Frontend  │────▶│           API Gateway (Nginx)        │   │
│  │  Next.js 16 │     └─────────────────────────────────────┘   │
│  │  Port 3000  │                      │                         │
│  └─────────────┘         ┌────────────┼────────────┐            │
│                          │            │            │            │
│  ┌───────────────────────┼────────────┼────────────┼──────────┐ │
│  │                       ▼            ▼            ▼          │ │
│  │  ┌─────────┐  ┌─────────────┐  ┌────────┐  ┌─────────┐    │ │
│  │  │  Auth   │  │  Template   │  │  Game  │  │  Room   │    │ │
│  │  │ :3001   │  │   :3002     │  │ :3003  │  │ :3004   │    │ │
│  │  └────┬────┘  └──────┬──────┘  └───┬────┘  └────┬────┘    │ │
│  │       │              │             │            │          │ │
│  │  ┌────┴────┐  ┌──────┴──────┐  ┌───┴────┐  ┌────┴────┐    │ │
│  │  │   WS    │  │   Result    │  │ Redis  │  │ Postgres│    │ │
│  │  │ :3005   │  │   :3006     │  │ :6379  │  │ :5432   │    │ │
│  │  └─────────┘  └─────────────┘  └────────┘  └─────────┘    │ │
│  │              Backend Services                              │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 서비스별 상세 분석

| 서비스 | 코드 라인 | 테스트 | 주요 역할 | 평가 |
|--------|----------|--------|----------|------|
| **auth-service** | ~500 LOC | 17개 (97%) | JWT 인증, 토큰 관리 | B+ |
| **template-service** | ~950 LOC | 19개 (85%) | 공개 템플릿 조회, 캐싱 | A- |
| **game-service** | ~1,200 LOC | 26개 (70%) | 게임 CRUD, 즐겨찾기 | B |
| **room-service** | ~1,285 LOC | 29개 (75%) | 방 생성, PIN 관리 | B+ |
| **ws-service** | ~1,600 LOC | 13개 (30%) | WebSocket, 실시간 게임 | B- |
| **result-service** | ~800 LOC | 22개 (60%) | 결과 저장, 통계 | B |
| **web (Frontend)** | ~15,800 LOC | 18개 (E2E) | Next.js UI | B+ |
| **shared** | ~3,200 LOC | N/A | 공용 타입, 플러그인 | A |

---

## 🔒 Part 2: 보안 분석

### 2.1 🔴 CRITICAL 보안 이슈

#### Issue #1: Sentry에 비밀번호 노출 위험
**파일**: `apps/auth-service/src/filters/sentry-exception.filter.ts:29`
**심각도**: 🔴 CRITICAL

```typescript
// 현재 코드 - 위험!
Sentry.setContext('request', {
  method: request.method,
  url: request.url,
  body: request.body,  // ❌ 비밀번호 포함 가능!
});
```

**수정 코드**:
```typescript
// 민감 데이터 제거
const sanitizedBody = {
  ...request.body,
  ...(request.body?.password && { password: '[REDACTED]' }),
  ...(request.body?.refreshToken && { refreshToken: '[REDACTED]' }),
};

Sentry.setContext('request', {
  method: request.method,
  url: request.url,
  body: sanitizedBody,
});
```

---

#### Issue #2: 미디어 파일 Base64 DB 저장 (용량 폭발 위험)
**파일**: `packages/database/prisma/schema.prisma` (mediaSettings Json)
**심각도**: 🔴 CRITICAL

**현재 상태**: 이미지/오디오/비디오를 Base64로 DB에 저장
- 10MB 이미지 → 13MB+ Base64 문자열
- DB 용량 급증 위험
- 쿼리 성능 저하

**필수 조치**:
1. AWS S3 버킷 생성
2. `mediaData` → `mediaUrl` 마이그레이션
3. CDN 연동으로 성능 개선

---

#### Issue #3: JWT_REFRESH_SECRET 환경변수 누락
**파일**: `apps/auth-service/.env.example`
**심각도**: 🔴 CRITICAL

```env
# 현재 - JWT_REFRESH_SECRET 없음!
JWT_SECRET=xingu-secret-key-change-in-production
JWT_EXPIRES_IN=15m

# 추가 필요:
JWT_REFRESH_SECRET=xingu-refresh-secret-change-in-production
```

---

#### Issue #4: 브루트포스 공격 취약 (계정 잠금 없음)
**파일**: `apps/auth-service/src/auth/auth.service.ts:62-78`
**심각도**: 🔴 CRITICAL

**현재**: 무제한 로그인 시도 가능
**필요**: 5회 실패 시 15분 잠금

```typescript
// 추가할 코드
private async checkAndUpdateFailedAttempts(email: string): Promise<void> {
  const key = `failed_login:${email}`;
  const attempts = await this.redis.incr(key);

  if (attempts >= 5) {
    await this.redis.expire(key, 900); // 15분 잠금
    throw new UnauthorizedException('계정이 일시 잠금되었습니다. 15분 후 다시 시도해주세요.');
  }

  await this.redis.expire(key, 300); // 5분 후 초기화
}
```

---

### 2.2 🟠 HIGH 보안 이슈

| # | 이슈 | 파일 | 영향 |
|---|------|------|------|
| 5 | 비밀번호 복잡성 미흡 (8자만 요구) | auth/dto/auth.dto.ts:3-6 | 취약한 비밀번호 허용 |
| 6 | PIN 생성에 Math.random() 사용 | room-service/services/room.service.ts:16 | 예측 가능한 PIN |
| 7 | 참가자 ID에 타임스탬프 패턴 | room-service/services/room.service.ts:147 | ID 추측 가능 |
| 8 | GET /rooms/:pin 인증 없음 | room-service/routes/room.routes.ts:10 | 방 정보 열람 가능 |
| 9 | 프론트엔드 localStorage 토큰 저장 | web/lib/auth/token-manager.ts:4-22 | XSS 취약점 |
| 10 | CSRF 토큰 미구현 | web/lib/api/client.ts | CSRF 공격 가능 |

---

### 2.3 보안 체크리스트

| 항목 | 상태 | 비고 |
|------|------|------|
| JWT 인증 | ✅ 구현됨 | Access + Refresh 토큰 |
| 비밀번호 해싱 | ✅ bcrypt 10 rounds | 안전 |
| Rate Limiting | ✅ 100 req/min | 전역 적용 |
| CORS 설정 | ✅ 환경변수로 관리 | Production 검증 필요 |
| SQL Injection | ✅ Prisma ORM | 안전 |
| XSS 방지 | ⚠️ React 자동 이스케이프 | dangerouslySetInnerHTML 없음 |
| CSRF 토큰 | ❌ 미구현 | 구현 필요 |
| 계정 잠금 | ❌ 미구현 | 구현 필요 |
| 이메일 인증 | ❌ 미구현 | 권장 |
| 보안 헤더 | ❌ 미구현 | CSP, X-Frame-Options 필요 |

---

## ⚡ Part 3: 성능 분석

### 3.1 데이터베이스 쿼리 이슈

#### Issue #1: game-service 루프 기반 업데이트 (N+1)
**파일**: `apps/game-service/src/services/game.service.ts:156-168`
**영향**: 50개 질문 업데이트 시 50+ 쿼리 발생

```typescript
// 현재 - 느림!
for (const q of toUpdate) {
  await tx.question.update({
    where: { id: q.id },
    data: { ... },
  });
}

// 개선 - 배치 업데이트
await tx.$executeRaw`
  UPDATE questions SET
    content = CASE id ${toUpdate.map(q => `WHEN '${q.id}' THEN '${q.content}'`).join(' ')} END,
    data = CASE id ${toUpdate.map(q => `WHEN '${q.id}' THEN '${JSON.stringify(q.data)}'::jsonb`).join(' ')} END
  WHERE id IN (${toUpdate.map(q => `'${q.id}'`).join(',')})
`;
```

---

#### Issue #2: result-service 비효율적 페이지네이션
**파일**: `apps/result-service/src/services/result.service.ts:134-172`
**영향**: 클라이언트 사이드 필터링으로 불필요한 데이터 로드

```typescript
// 현재 - 비효율적
const rooms = await prisma.room.findMany({
  where: { gameId },
  include: { result: true },  // NULL 포함!
});
const results = rooms.filter((room) => room.result !== null);  // 클라이언트 필터링

// 개선
const results = await prisma.gameResult.findMany({
  where: { room: { gameId } },
  orderBy: { createdAt: 'desc' },
  take: limit,
});
```

---

### 3.2 캐싱 전략 분석

| 서비스 | Redis 사용 | 캐시 Hit Rate | 개선 필요 |
|--------|-----------|---------------|----------|
| template-service | ✅ 1시간 TTL | ~80% (예상) | ✅ 좋음 |
| game-service | ❌ 미사용 | 0% | ⚠️ 구현 필요 |
| room-service | ✅ 세션 관리 | N/A | ✅ 좋음 |
| ws-service | ✅ 상태 관리 | N/A | ✅ 좋음 |
| result-service | ❌ 미사용 | 0% | ⚠️ 구현 권장 |

---

### 3.3 프론트엔드 성능 이슈

#### Issue #1: Browse 페이지 불필요한 리렌더링
**파일**: `apps/web/src/app/browse/page.tsx:100-193`

```typescript
// 현재 - 매번 재계산
const filteredTemplates = sortGames(filterByMobile(filterByCategory(filterBySearch(templates))));

// 개선 - useMemo 사용
const filteredTemplates = useMemo(
  () => sortGames(filterByMobile(filterByCategory(filterBySearch(templates)))),
  [templates, searchQuery, gameCategory, mobileFilter, sortBy]
);
```

#### Issue #2: GameCard 컴포넌트 memo 미적용
**파일**: `apps/web/src/app/browse/page.tsx:630-783`

```typescript
// 현재
function GameCard({ game, isFavorite, ... }: GameCardProps) { ... }

// 개선
const GameCard = React.memo(function GameCard(props: GameCardProps) {
  // ...
}, (prev, next) => prev.game.id === next.game.id && prev.isFavorite === next.isFavorite);
```

---

## 🧹 Part 4: 코드 품질 분석

### 4.1 🔴 CRITICAL: 500줄 규칙 위반

**CLAUDE.md 규칙**: "No files over 500 lines (must split)"

| 파일 | 라인 수 | 상태 |
|------|---------|------|
| `apps/web/src/app/browse/page.tsx` | **784줄** | 🔴 위반 |
| `apps/ws-service/src/handlers/game.handler.ts` | **792줄** | 🔴 위반 |
| `apps/web/src/lib/hooks/use-game-socket.ts` | **390줄** | ⚠️ 주의 |

**browse/page.tsx 분리 계획**:
```
app/browse/
├── page.tsx (120줄) - 메인 셸
├── BrowsePage.tsx (300줄) - 주요 로직
├── GameCard.tsx (150줄) - 카드 컴포넌트
├── HeroSection.tsx (80줄)
├── FilterBar.tsx (100줄)
└── utils.ts (필터/정렬 함수)
```

---

### 4.2 타입 안전성 이슈

#### Issue #1: `as any` 타입 캐스팅
**파일**: `apps/game-service/src/services/game.service.ts:80,174,189`

```typescript
// 현재 - 타입 안전성 손실
...(gameData as any)

// 개선 - 적절한 타입 정의
const prismaGameData: Prisma.GameCreateInput = {
  ...gameData,
  gameType: gameData.gameType as GameType,
  category: gameData.category as Category,
};
```

#### Issue #2: JSON 필드 타입 안전성
**파일**: `apps/result-service/src/services/result.service.ts:29-30`

```typescript
// 현재 - 런타임 오류 가능
leaderboard: result.leaderboard as any,
questionStats: result.questionStats as any,

// 개선 - Zod 검증 추가
const leaderboardSchema = z.array(z.object({
  rank: z.number(),
  nickname: z.string(),
  score: z.number(),
}));
const validated = leaderboardSchema.parse(result.leaderboard);
```

---

### 4.3 코드 중복 이슈

#### Issue #1: GameResult 생성 로직 3회 중복
**파일**: `apps/ws-service/src/handlers/game.handler.ts`
- Line 199-212 (NEXT_QUESTION)
- Line 663-677 (END_QUESTION timeout)
- Line 751-765 (END_GAME)

**해결**: 헬퍼 함수 추출
```typescript
async function createGameResultAndEnd(io: Server, pin: string, state: RoomState) {
  const finalPlayers = Object.values(state.players);
  const finalLeaderboard = finalPlayers
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((p, i) => ({ rank: i + 1, nickname: p.nickname, score: p.score }));

  await prisma.gameResult.create({ data: { ... } });
  await prisma.room.update({ where: { pin }, data: { status: 'FINISHED', endedAt: new Date() } });
  io.to(`room:${pin}`).emit(WS_EVENTS.GAME_ENDED, { leaderboard: finalLeaderboard, room: state });
}
```

---

### 4.4 에러 처리 이슈

#### Issue #1: setTimeout 에러 처리 누락
**파일**: `apps/ws-service/src/handlers/game.handler.ts:632-697`

```typescript
// 현재 - 에러 무시됨
setTimeout(async () => {
  const nextState = await roomStateService.nextQuestion(pin);
  // ... 에러 처리 없음!
}, 5000);

// 개선
setTimeout(async () => {
  try {
    const nextState = await roomStateService.nextQuestion(pin);
    // ...
  } catch (error) {
    logger.error('Auto-advance failed', { error, pin });
    Sentry.captureException(error);
    io.to(`room:${pin}`).emit(WS_EVENTS.ERROR, {
      code: 'AUTO_ADVANCE_FAILED',
      message: '자동 진행에 실패했습니다. 수동으로 다음 버튼을 눌러주세요.',
    });
  }
}, 5000);
```

---

## 🧪 Part 5: 테스트 커버리지 분석

### 5.1 서비스별 테스트 현황

| 서비스 | 총 테스트 | 통과 | 실패 | 커버리지 | 목표 대비 |
|--------|----------|------|------|----------|----------|
| auth-service | 17 | 17 | 0 | 97% | ✅ |
| template-service | 19 | 19 | 0 | 85% | ✅ |
| game-service | 26 | 26 | 0 | 70% | ⚠️ |
| room-service | 29 | 28 | 1 | 75% | ⚠️ |
| ws-service | 13 | 6 | 7 | 30% | ❌ |
| result-service | 22 | 16 | 6 | 60% | ❌ |
| **Total** | **126** | **112** | **14** | **~70%** | ⚠️ |

### 5.2 누락된 테스트 영역

#### 🔴 CRITICAL 누락
1. **ws-service handlers** - 실시간 게임 플로우 테스트 0%
2. **room-service 통합 테스트** - Redis 연동 테스트 없음
3. **E2E 테스트** - 전체 게임 플로우 미검증

#### 🟠 HIGH 누락
4. game-service 즐겨찾기 CRUD 테스트
5. result-service playCount 증가 로직
6. Frontend 컴포넌트 유닛 테스트

### 5.3 테스트 실패 원인

```
result-service (6 failures):
- prisma.room.count is not a function → Mock 설정 누락

ws-service (7 failures):
- 예상값 불일치 (DEFAULT_BASE_POINTS: 1000→100 변경됨)
```

---

## 🗄️ Part 6: 데이터베이스 & 캐싱

### 6.1 인덱스 전략 분석

**현재 인덱스** (schema.prisma):
```prisma
// games 테이블 - 5개 인덱스
@@index([gameType, isPublic])
@@index([category, isPublic])
@@index([gameCategory, isPublic])
@@index([userId])
@@index([sourceGameId])

// rooms 테이블 - 3개 인덱스
@@index([pin])
@@index([organizerId])
@@index([expiresAt])

// questions 테이블 - 1개 인덱스
@@index([gameId, order])
```

**추가 필요 인덱스**:
```sql
-- 게임 결과 조회 최적화
CREATE INDEX idx_game_results_room_created ON game_results(roomId, createdAt);

-- 인기 게임 정렬 최적화
CREATE INDEX idx_games_play_count ON games(playCount DESC) WHERE isPublic = true;
```

### 6.2 Redis 키 전략

```typescript
// 현재 키 패턴 (shared/constants/redis.ts)
REDIS_KEYS = {
  ROOM_STATE: (pin) => `room:${pin}:state`,           // 24시간 TTL
  ROOM_PARTICIPANTS: (pin) => `room:participants:${pin}`, // 2시간 TTL
  PARTICIPANT_SESSION: (id) => `participant:session:${id}`, // 6시간 TTL
  TEMPLATE_CACHE: (id) => `template:cache:${id}`,     // 1시간 TTL
  NULL_CACHE: 300,                                     // 5분 (캐시 관통 방지)
  PARTY_GAME_SESSION: (pin) => `party:session:${pin}`, // 24시간 TTL
}
```

**평가**: ✅ 잘 설계됨 - TTL 값이 적절하고 키 네이밍이 명확함

---

## 🔌 Part 7: 플러그인 시스템

### 7.1 등록된 플러그인 (5개)

| 플러그인 | 타입 | 카테고리 | 상태 |
|----------|------|----------|------|
| true-false | `true-false` | QUIZ | ✅ 안정 |
| multiple-choice | `multiple-choice` | QUIZ | ✅ 안정 |
| short-answer | `short-answer` | QUIZ | ✅ 안정 |
| balance-game | `balance-game` | QUIZ | ✅ 안정 |
| liar-game | `liar-game` | PARTY | ✅ 안정 |

### 7.2 점수 계산 공식 (Kahoot 스타일)

```typescript
// 정답인 경우
totalPoints = basePoints + speedBonus
speedBonus = Math.floor(basePoints * multiplier * (remainingTime / totalTime))

// 예시: 30초 문제, 10초만에 정답
// basePoints = 100, multiplier = 0.3
// speedBonus = floor(100 * 0.3 * (20/30)) = 20
// totalPoints = 100 + 20 = 120점
```

### 7.3 GameType Enum 불일치 문제

**Prisma Schema**:
```prisma
enum GameType {
  OX_QUIZ
  BALANCE_GAME
  INITIAL_QUIZ
  FOUR_CHOICE_QUIZ
  SPEED_QUIZ
  // ❌ LIAR_GAME 누락!
}
```

**TypeScript Enum** (shared/types/game.types.ts):
```typescript
enum GameType {
  OX_QUIZ = 'OX_QUIZ',
  BALANCE_GAME = 'BALANCE_GAME',
  INITIAL_QUIZ = 'INITIAL_QUIZ',
  FOUR_CHOICE_QUIZ = 'FOUR_CHOICE_QUIZ',
  SPEED_QUIZ = 'SPEED_QUIZ',
  LIAR_GAME = 'LIAR_GAME',  // ✅ 있음
}
```

**수정 필요**: Prisma schema에 `LIAR_GAME` 추가

---

## ♿ Part 8: 접근성 (a11y)

### 8.1 현재 구현 상태

| 요소 | 상태 | 비고 |
|------|------|------|
| ARIA 속성 | ✅ 양호 | Timer, Leaderboard에 적용 |
| 시맨틱 HTML | ✅ 양호 | button, nav, label 사용 |
| 키보드 네비게이션 | ⚠️ 부분 | 게임 답변 버튼 미지원 |
| 색상 대비 | ✅ 양호 | 기본 색상 대비 충분 |
| alt 텍스트 | ❌ 누락 | 미디어 이미지에 없음 |
| 포커스 관리 | ✅ 양호 | 모달, 폼에 적용 |

### 8.2 접근성 개선 필요 항목

1. **미디어 alt 텍스트 추가**
```typescript
// 현재
<img src={imageUrl} />

// 수정
<img
  src={imageUrl}
  alt={`${question.content} 관련 이미지`}
  loading="lazy"
/>
```

2. **게임 버튼 키보드 지원**
```typescript
<button
  onClick={() => onAnswerSelect(option)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onAnswerSelect(option);
    }
  }}
  tabIndex={0}
>
  {option}
</button>
```

---

## 📋 Part 9: 우선순위별 개선 계획

### 9.1 🔴 CRITICAL (1주일 내 수정)

| # | 이슈 | 파일 | 예상 시간 |
|---|------|------|----------|
| 1 | Sentry 비밀번호 노출 수정 | auth-service/filters/sentry-exception.filter.ts | 30분 |
| 2 | JWT_REFRESH_SECRET 환경변수 추가 | .env.example, .env.production.example | 15분 |
| 3 | 계정 잠금 메커니즘 구현 | auth-service/auth.service.ts | 4시간 |
| 4 | browse/page.tsx 500줄 분리 | web/src/app/browse/ | 3시간 |
| 5 | game.handler.ts 에러 처리 추가 | ws-service/handlers/game.handler.ts | 2시간 |
| 6 | 테스트 실패 수정 (14개) | result-service, ws-service | 3시간 |
| 7 | 보안 헤더 추가 | next.config.js | 30분 |
| 8 | 비밀번호 복잡성 강화 | auth-service/dto/auth.dto.ts | 30분 |

**총 예상 시간**: ~14시간

---

### 9.2 🟠 HIGH (2주 내 수정)

| # | 이슈 | 파일 | 예상 시간 |
|---|------|------|----------|
| 9 | S3 미디어 마이그레이션 설계 | packages/database/schema.prisma | 8시간 |
| 10 | game-service 배치 업데이트 구현 | game-service/services/game.service.ts | 3시간 |
| 11 | result-service 페이지네이션 수정 | result-service/services/result.service.ts | 1시간 |
| 12 | ws-service 핸들러 테스트 작성 | ws-service/__tests__/ | 8시간 |
| 13 | GameType enum 정렬 | schema.prisma, game.types.ts | 1시간 |
| 14 | React.memo GameCard 적용 | browse/page.tsx | 1시간 |
| 15 | useMemo 필터링 최적화 | browse/page.tsx | 1시간 |
| 16 | 게임 결과 중복 코드 리팩토링 | ws-service/handlers/game.handler.ts | 2시간 |
| 17 | CSRF 토큰 구현 | web/lib/api/client.ts | 3시간 |
| 18 | PIN 생성 crypto.randomInt 사용 | room-service/services/room.service.ts | 30분 |

**총 예상 시간**: ~28.5시간

---

### 9.3 🟡 MEDIUM (1개월 내 수정)

| # | 이슈 | 파일 | 예상 시간 |
|---|------|------|----------|
| 19 | game-service Redis 캐싱 구현 | game-service/services/ | 6시간 |
| 20 | 이미지 alt 텍스트 추가 | 컴포넌트 전체 | 2시간 |
| 21 | 키보드 네비게이션 개선 | 게임 컴포넌트 | 3시간 |
| 22 | E2E 테스트 확장 | web/__tests__/ | 10시간 |
| 23 | 에러 바운더리 추가 | web/app/error.tsx | 2시간 |
| 24 | 즐겨찾기 테스트 추가 | game-service/__tests__/ | 3시간 |
| 25 | 로그아웃 API 호출 추가 | browse/page.tsx | 30분 |
| 26 | 방 만료 자동 정리 작업 | 별도 서비스 | 4시간 |

**총 예상 시간**: ~30.5시간

---

### 9.4 🟢 LOW (분기 내 수정)

| # | 이슈 | 파일 | 예상 시간 |
|---|------|------|----------|
| 27 | 코드 주석 정리 | 전체 | 4시간 |
| 28 | Storybook 컴포넌트 문서화 | web/stories/ | 8시간 |
| 29 | API 문서 자동 생성 | Swagger/OpenAPI | 6시간 |
| 30 | 모니터링 대시보드 구축 | Grafana/Prometheus | 10시간 |
| 31 | 성능 벤치마크 도구 | k6/Artillery | 5시간 |
| 32 | 이메일 인증 구현 | auth-service | 8시간 |

**총 예상 시간**: ~41시간

---

## 🚀 Part 10: Step-by-Step 구현 가이드

### Phase 1: 즉시 수정 (Day 1-3)

#### Step 1.1: Sentry 비밀번호 노출 수정
```bash
# 파일 수정
apps/auth-service/src/filters/sentry-exception.filter.ts
```

```typescript
// Line 26-31 수정
const sanitizedBody = {
  ...request.body,
  ...(request.body?.password && { password: '[REDACTED]' }),
  ...(request.body?.refreshToken && { refreshToken: '[REDACTED]' }),
  ...(request.body?.newPassword && { newPassword: '[REDACTED]' }),
};

Sentry.setContext('request', {
  method: request.method,
  url: request.url,
  body: sanitizedBody,
});
```

#### Step 1.2: 환경변수 추가
```bash
# 파일 수정
apps/auth-service/.env.example
.env.production.example
```

```env
# JWT Refresh Token Secret (반드시 JWT_SECRET과 다르게!)
# 생성: openssl rand -base64 32
JWT_REFRESH_SECRET=xingu-refresh-secret-change-in-production
```

#### Step 1.3: 비밀번호 복잡성 강화
```bash
# 파일 수정
apps/auth-service/src/auth/dto/auth.dto.ts
```

```typescript
export const SignupDtoSchema = z.object({
  email: z.string().email('유효하지 않은 이메일 형식입니다'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(/[A-Z]/, '비밀번호에 대문자가 최소 1개 포함되어야 합니다')
    .regex(/[0-9]/, '비밀번호에 숫자가 최소 1개 포함되어야 합니다')
    .regex(/[!@#$%^&*]/, '비밀번호에 특수문자(!@#$%^&*)가 최소 1개 포함되어야 합니다'),
  name: z.string().min(1, '이름은 필수입니다').optional(),
});
```

#### Step 1.4: 보안 헤더 추가
```bash
# 파일 수정
apps/web/next.config.js
```

```javascript
const nextConfig = {
  // ... 기존 설정 ...
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
          },
        ],
      },
    ];
  },
};
```

---

### Phase 2: 코드 품질 개선 (Day 4-7)

#### Step 2.1: browse/page.tsx 분리

**새 파일 구조**:
```
apps/web/src/app/browse/
├── page.tsx (120줄)
├── _components/
│   ├── BrowseContent.tsx (350줄)
│   ├── GameCard.tsx (150줄)
│   ├── HeroSection.tsx (80줄)
│   └── FilterBar.tsx (100줄)
└── _utils/
    └── filters.ts (50줄)
```

#### Step 2.2: 테스트 실패 수정

```bash
# result-service Mock 수정
apps/result-service/src/__tests__/setup.ts
```

```typescript
vi.mock('@xingu/database', () => ({
  prisma: {
    gameResult: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    room: {
      findUnique: vi.fn(),
      count: vi.fn(),  // 추가!
      findMany: vi.fn(),
    },
    game: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));
```

---

### Phase 3: 성능 최적화 (Week 2)

#### Step 3.1: game-service 배치 업데이트

```typescript
// apps/game-service/src/services/game.service.ts
// 기존 for 루프 대체

// 방법 1: Prisma Raw Query
if (toUpdate.length > 0) {
  const updates = toUpdate.map(q => ({
    id: q.id,
    content: q.content,
    data: JSON.stringify(q.data),
    order: q.order,
  }));

  await tx.$executeRaw`
    UPDATE questions AS q
    SET content = u.content,
        data = u.data::jsonb,
        "order" = u."order"
    FROM (SELECT * FROM jsonb_to_recordset(${JSON.stringify(updates)}::jsonb)
          AS x(id text, content text, data text, "order" int)) AS u
    WHERE q.id = u.id
  `;
}
```

#### Step 3.2: React 최적화

```typescript
// apps/web/src/app/browse/page.tsx (또는 BrowseContent.tsx)

// 1. useMemo로 필터링 최적화
const filteredGames = useMemo(() => {
  return games
    .filter(g => !searchQuery || g.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(g => gameCategory === 'all' || g.gameCategory === gameCategory)
    .filter(g => mobileFilter === 'all' ||
      (mobileFilter === 'mobile' ? g.needsMobile : !g.needsMobile))
    .sort((a, b) => {
      if (sortBy === 'popular') return b.playCount - a.playCount;
      if (sortBy === 'favorites') return b.favoriteCount - a.favoriteCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}, [games, searchQuery, gameCategory, mobileFilter, sortBy]);

// 2. GameCard memo 적용
const GameCard = React.memo(function GameCard({ game, isFavorite, onToggleFavorite }) {
  // ... 기존 코드
}, (prev, next) =>
  prev.game.id === next.game.id &&
  prev.isFavorite === next.isFavorite
);
```

---

### Phase 4: 보안 강화 (Week 2-3)

#### Step 4.1: 계정 잠금 구현

```typescript
// apps/auth-service/src/auth/auth.service.ts

// 새 메서드 추가
private async checkFailedAttempts(email: string): Promise<void> {
  const key = `failed_login:${email}`;
  const attempts = await this.redis.get(key);
  const count = attempts ? parseInt(attempts, 10) : 0;

  if (count >= 5) {
    const ttl = await this.redis.ttl(key);
    throw new UnauthorizedException(
      `계정이 일시 잠금되었습니다. ${Math.ceil(ttl / 60)}분 후 다시 시도해주세요.`
    );
  }
}

private async incrementFailedAttempts(email: string): Promise<void> {
  const key = `failed_login:${email}`;
  const attempts = await this.redis.incr(key);

  if (attempts === 1) {
    await this.redis.expire(key, 300); // 5분 후 초기화
  } else if (attempts >= 5) {
    await this.redis.expire(key, 900); // 15분 잠금
  }
}

private async resetFailedAttempts(email: string): Promise<void> {
  await this.redis.del(`failed_login:${email}`);
}

// login 메서드 수정
async login(dto: LoginDto): Promise<AuthResponse> {
  await this.checkFailedAttempts(dto.email);

  const user = await this.prisma.user.findUnique({
    where: { email: dto.email },
  });

  if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
    await this.incrementFailedAttempts(dto.email);
    throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다');
  }

  await this.resetFailedAttempts(dto.email);
  return this.generateTokens(user);
}
```

#### Step 4.2: CSRF 토큰 구현

```typescript
// apps/web/src/lib/api/client.ts

// 요청 인터셉터에 추가
this.client.interceptors.request.use((config) => {
  // CSRF 토큰 추가 (POST, PUT, DELETE, PATCH)
  if (config.method && ['post', 'put', 'delete', 'patch'].includes(config.method)) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }

  // 기존 토큰 로직...
  const token = tokenManager.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
```

---

## 📊 Part 11: 검증 체크리스트

### 배포 전 필수 검증

```bash
# 1. 타입 체크
pnpm type-check

# 2. 린트
pnpm lint

# 3. 테스트 (80% 커버리지 목표)
pnpm test

# 4. 빌드
pnpm build

# 5. E2E 테스트
pnpm --filter=@xingu/web test:e2e
```

### 서비스별 검증 명령어

```bash
# Auth Service
pnpm --filter=@xingu/auth-service test
pnpm --filter=@xingu/auth-service type-check

# Template Service
pnpm --filter=@xingu/template-service test

# Game Service
pnpm --filter=@xingu/game-service test

# Room Service
pnpm --filter=@xingu/room-service test

# WS Service
pnpm --filter=@xingu/ws-service test

# Result Service
pnpm --filter=@xingu/result-service test

# Frontend
pnpm --filter=@xingu/web test:e2e
pnpm --filter=@xingu/web build
```

---

## 📈 Part 12: 예상 효과

### 보안 개선 효과

| 이슈 | 수정 전 | 수정 후 |
|------|---------|---------|
| 비밀번호 노출 | Sentry에 평문 전송 | 마스킹 처리 |
| 브루트포스 | 무제한 시도 가능 | 5회 제한 + 15분 잠금 |
| 비밀번호 강도 | 8자 이상만 | 대문자+숫자+특수문자 필수 |
| XSS | CSP 헤더 없음 | CSP 적용 |
| Clickjacking | 보호 없음 | X-Frame-Options: DENY |

### 성능 개선 효과

| 영역 | 수정 전 | 수정 후 | 개선율 |
|------|---------|---------|--------|
| 게임 업데이트 (50문항) | ~500ms (50쿼리) | ~100ms (1쿼리) | 80% ↓ |
| Browse 페이지 리렌더링 | 매번 전체 필터링 | useMemo 캐싱 | 60% ↓ |
| GameCard 렌더링 | 부모 변경 시 전체 | memo로 최적화 | 70% ↓ |
| 결과 페이지네이션 | 클라이언트 필터링 | DB 레벨 필터링 | 50% ↓ |

### 코드 품질 개선 효과

| 지표 | 수정 전 | 수정 후 |
|------|---------|---------|
| 500줄 초과 파일 | 2개 | 0개 |
| 테스트 통과율 | 88.9% (112/126) | 100% (126/126) |
| 타입 안전성 | `as any` 4곳 | 0곳 |
| 중복 코드 | 3곳 GameResult 생성 | 1곳 (헬퍼 함수) |

---

## 🎯 결론

### 현재 상태 요약
Xingu 프로젝트는 **전반적으로 잘 설계된 MSA 아키텍처**를 가지고 있으며, 특히:
- ✅ 플러그인 시스템이 확장 가능하게 설계됨
- ✅ 타입 안전성이 우수함 (`any` 최소화)
- ✅ WebSocket 실시간 기능이 잘 구현됨
- ✅ Redis 캐싱 전략이 적절함

### 핵심 개선 필요 사항
1. **보안**: 비밀번호 노출 방지, 계정 잠금, CSRF 토큰
2. **성능**: 배치 쿼리, React 최적화
3. **코드 품질**: 파일 분리, 테스트 커버리지
4. **미디어**: S3 마이그레이션 (배포 전 필수)

### 예상 총 작업 시간
- 🔴 CRITICAL: ~14시간
- 🟠 HIGH: ~28.5시간
- 🟡 MEDIUM: ~30.5시간
- 🟢 LOW: ~41시간
- **총합**: ~114시간 (약 3주 풀타임)

---

**이 분석 보고서를 기반으로 단계별 개선 작업을 시작할 준비가 되었습니다.**
