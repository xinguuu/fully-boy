# Xingu Project - Claude AI Assistant Guide

> **Core Guide**: Project identity, mandatory rules, current status only
> **Detailed Content**: See [docs/06-development-guide.md](docs/06-development-guide.md)
> **Full Documentation**: [docs/00-INDEX.md](docs/00-INDEX.md) (Documentation guide map)

---

## 📌 Project Overview

**Xingu** is a Korean-style party game platform inspired by Kahoot.

### Key Differentiators
- **Game Framework Provided**: Create games in 5 minutes with template customization only
- **Flexible Participation Modes**: Mobile-required mode + MC mode (host-driven without phones)
- **Trendy Content**: Focused on Korean variety shows, SNS trends, and memes
- **Easy Customization**: Just modify questions/content, framework is provided

---

## 🏗️ Architecture

**MSA (Microservice Architecture)**: 6 Backend Services + Frontend + 3 Infrastructure
**Detailed Diagrams**: [docs/04-architecture.md](docs/04-architecture.md)

### Core Structure
- **Frontend**: Next.js 16 (App Router) + React 19
- **Backend**: 6 Services (NestJS + Express + Socket.io)
- **Database**: PostgreSQL 17 + Redis
- **Infra**: Docker + Nginx + Turborepo monorepo

**→ Detailed Info**: [docs/01-overview.md](docs/01-overview.md#technology-stack) | [docs/04-architecture.md](docs/04-architecture.md)

---

## 🌟 Development Philosophy

**Xingu is a project with a long-term vision. We look to the distant future.**

### Core Principles

1. **Scalability > Quick Implementation**
   - Prioritize long-term architecture over short-term solutions
   - Choose "easily scalable later" over "fix it quickly now"
   - Always ask: "What happens if this structure scales 10x?"

2. **Don't Fear Refactoring**
   - If you find a bad structure, refactor it immediately
   - Technical debt compounds - fixing early is always cheaper
   - "We'll fix it later" is a banned phrase

3. **Design for Future Changes**
   - Can new game types be added?
   - Can new scoring methods be added?
   - Can new participation modes be added?
   - **Is it extensible via a plugin system?**

4. **Zero Technical Debt Policy**
   - Don't leave "temporary implementation" in TODO comments
   - Document compromised designs and create improvement plans
   - Conduct weekly technical debt reviews

5. **Quality > Speed**
   - Doing it right is more important than doing it fast
   - However, "right" doesn't mean over-engineering
   - Balance YAGNI (You Aren't Gonna Need It) with scalability

### Decision Framework

**When implementing new features/changes, ask yourself:**

```
1. Will this structure work if it scales 10x?
2. Will adding new game types/features require modifying existing code? (OCP violation)
3. Will another developer understand this code in 6 months?
4. Are you confident changing this code without tests?
5. Is this pattern acceptable to apply project-wide?
```

**If any answer is "No", consider refactoring.**

---

## 🎯 Development Workflow

### 1. Task-Driven Development (MANDATORY)
- **Always create TODOs first** before coding
- Break tasks into 2+ units
- Check off immediately after completion

### 2. TDD (Test-Driven Development)
1. **🔴 RED**: Write failing test
2. **🟢 GREEN**: Minimal code to pass
3. **🔵 REFACTOR**: Optimize

### 3. Validation (MANDATORY after coding)
```bash
pnpm type-check  # 0 errors
pnpm lint        # 0 warnings
pnpm test        # >80% coverage
pnpm build       # All packages
```

### 4. SOLID Principles
- **SRP**: One responsibility per component
- **OCP**: Open for extension, closed for modification
- **DIP**: Depend on abstractions

---

## 🚨 CRITICAL RULES (Absolute)

### Development Process
1. **No coding without TODOs**
2. **No code without tests** (min 80% coverage)
3. **No next task until build/test pass**
4. **No work completion without documentation update**
5. **No quick fixes without considering scalability** (Always ask: "Does this scale 10x?")
6. **No postponing refactoring** ("We'll fix it later" is banned)

### Code Quality
7. **No `any` type** (use `unknown`)
8. **No `console.log` in production** (use structured logging)
9. **No hardcoding** (use env vars or constants)
10. **No files over 500 lines** (must split)
11. **No missing async error handling**
12. **No redundant comments** (complex logic only)

### Frontend Rules
13. **ALWAYS follow [docs/02-ia.md](docs/02-ia.md)** (UI structure, user flows)
14. **ALWAYS follow [docs/05-design-guide.md](docs/05-design-guide.md)** (colors, typography, styling)
15. **ALWAYS check backend code when developing frontend APIs**:
    - Read backend DTO schemas
    - Match request/response types exactly
    - Frontend validation must match backend validation

### Backend Rules
16. **ALWAYS follow [docs/03-prd.md](docs/03-prd.md)** (API specs, business requirements):
    - Check API endpoints definition
    - Verify request/response schemas
    - Follow business logic requirements

### Deployment Rules
17. **No deployment without passing ALL checks**:
    - ✅ Type-check (0 errors)
    - ✅ Lint (0 warnings)
    - ✅ Unit tests (>80% coverage)
    - ✅ E2E tests (critical flows)
    - ✅ Security scan (no CRITICAL vulnerabilities)

### Security Rules
18. **No production secrets in code** (use secret management)
19. **No unencrypted PII** (encrypt at rest and in transit)
20. **No single point of failure** (min 2 replicas)
21. **No skipping error tracking** (Sentry mandatory)

### Accessibility & Standards
22. **No ignoring accessibility** (WCAG 2.1 AA compliance)
23. **Follow language policy**: Code/docs in English, UI in Korean (i18n)

---

## 📝 Coding Conventions (Summary)

**Detailed Content**: [docs/06-development-guide.md](docs/06-development-guide.md#coding-conventions)

### File Naming
- Components: `Button.tsx` (PascalCase)
- Utils: `formatDate.ts` (camelCase)
- Hooks: `useAuth.ts` (camelCase + use prefix)
- Types: `user.types.ts` (camelCase + .types)

### Import Order
1. External packages (`react`, `next`)
2. Monorepo packages (`@xingu/shared`)
3. Internal modules (`../types/user`)
4. Use `import type` for types

### NO Redundant Comments
```typescript
// ❌ BAD - obvious from code
// Create user
function createUser() {}

// ✅ GOOD - complex business logic
/**
 * Get existing tags or create new ones, handling duplicates.
 * Tags are case-insensitive and normalized before storage.
 */
async getOrCreateTags(tagNames: string[]): Promise<Tag[]>
```

---

## 💡 Claude Assistant Behavior

### ⚠️ Important: Running Services
**DO NOT start backend services in terminal!**
- The user is already running all 6 backend services in separate terminals
- Only start frontend (`pnpm --filter=@xingu/web dev`) if needed
- Never run `pnpm dev` commands for backend services (auth, template, game, room, ws, result)

### At Start of Work
1. Create TODO list (3-10 items)
2. Set first TODO to 'in_progress'

### While Writing Code
1. Follow TDD (test → code → refactor)
2. Apply SOLID principles
3. TypeScript strict mode compliance

### After Writing Code
1. Run validation: `pnpm type-check && pnpm test && pnpm build`
2. Fix immediately if failed
3. Check TODO completion
4. **Sync documentation if changed** (MANDATORY):
   - UI flow/screen order changes → Update [docs/02-ia.md](docs/02-ia.md)
   - Design/style changes → Update [docs/05-design-guide.md](docs/05-design-guide.md)
   - API spec changes → Update [docs/03-prd.md](docs/03-prd.md)
5. **Update [docs/06-development-guide.md](docs/06-development-guide.md) "Recent Changes"** (after all work completed)
6. **Update CLAUDE.md "Current Status" / "Next Steps"** (for significant project changes)
7. Move to next TODO

### Work Session Completion (MANDATORY)
- ✅ All validation checks passed
- ✅ TODOs updated
- ✅ "Recent Changes" updated in [docs/06-development-guide.md](docs/06-development-guide.md)
- ✅ Next steps identified

---

## 🔄 Current Status

### Project Stage
- **Architecture**: ✅ 6-Service MSA defined
- **Infrastructure**: ✅ Docker + PostgreSQL + Redis ready
- **Backend**: ✅ **100% Complete** (~126 unit tests + 10 E2E tests)
- **Frontend**: ✅ **Foundation + Core Pages Complete**
- **Testing**: ✅ ~126 backend unit tests + 10 backend E2E tests + 18 browser E2E tests (Playwright)

### Backend Services (100% Complete)

| Service | API | Tests | Status |
|---------|-----|-------|--------|
| auth-service | ✅ | 17 tests ✅ | 100% |
| template-service | ✅ | 19 tests ✅ | 100% |
| game-service | ✅ | 26 tests ✅ | 100% |
| room-service | ✅ | 29 tests (28✅/1⚠️) | 100% |
| ws-service | ✅ | 13 tests (6✅/7⚠️) | 100% |
| result-service | ✅ | 22 tests (16✅/6⚠️) | 100% |

**Note**: Some test expectations need sync with updated scoring constants (DEFAULT_BASE_POINTS: 1000→100)

**Total: ~126 unit tests + 10 E2E tests** 🎉

### Frontend Pages

| Page | Status | Details |
|------|--------|---------|
| Homepage (PIN Entry) | ✅ Complete | Kahoot-style, Korean text |
| Login / Signup | ✅ Complete | JWT auth, token refresh |
| Browse | ✅ Complete | 2 tabs, filters, favorites, mobile filter, profile dropdown with icons |
| Edit Screen | ✅ Complete | **3-column layout** (list \| edit panel \| preview), bulk settings, draft mode |
| Join Page | ✅ Complete | `/room/[pin]` - Nickname entry |
| Waiting Room | ✅ Complete | PIN display, real-time participants |
| Live Game | ✅ Complete | WebSocket integration, real-time scoring |
| **Game Results** | ✅ Complete | **Integrated in Live Game page** - Final leaderboard |
| **Play History** | ✅ Complete | `/history` - All play records across games |
| **Result Detail** | ✅ Complete | `/results/[id]` - Detailed leaderboard and stats |
| **Game History** | ✅ Complete | `/games/[id]/history` - Play records for specific game |

### What's Working

#### Core Infrastructure
- ✅ All 6 backend services (local dev ready)
- ✅ PostgreSQL + Redis (Docker containers)
- ✅ JWT authentication + token refresh
- ✅ WebSocket real-time gameplay
- ✅ Session management (tab close recovery)
- ✅ Frontend auth (login/signup working)
- ✅ Next.js dev server (http://localhost:3000)
- ✅ Browser E2E testing (Playwright with 18 tests)
- ✅ **Production build** (All 9 packages build successfully)

#### Code Quality & Performance
- ✅ **Structured logging** (Winston for backend, custom logger for frontend)
- ✅ **Game update optimization** (DELETE+CREATE → Upsert pattern, 10x faster)
- ✅ **Browse page optimization** (conditional fetching, 50% API reduction)
- ✅ **WebSocket memory leak prevention** (Redis TTL auto-cleanup instead of setTimeout)
- ✅ **Production-ready logging** (environment-based, file rotation, no console.log)
- ✅ **Performance optimizations** (compression, image optimization, SEO)
- ✅ **Favorite API integration** (isFavorite field in response, 66% API call reduction)
- ✅ **Optimistic updates** (instant UI feedback for favorite toggles)
- ✅ **Type Integration** (100% Frontend ↔ Backend type consistency via @xingu/shared)
- ✅ **React Query cache optimization** (staleTime/gcTime for templates, games, favorites)
- ✅ **Redis SCAN migration** (non-blocking operations, production-safe cache invalidation)

#### Features
- ✅ **Question intro screen** (2-second "1/3" display before each question)
- ✅ **Multiple question types** (multiple-choice, true-false, short-answer, liar-game, balance-game)
- ✅ **Template questions loading** (creates copies from template)
- ✅ **Server-based synchronized timer** (absolute time sync across all clients)
- ✅ **Organizer reconnection handling** (auto-detect organizer without nickname prompt)
- ✅ **Plugin System** (frontend + backend, 5 game types: multiple-choice, true-false, short-answer, liar-game, balance-game)
- ✅ **Question media support** (image, audio, video with QuestionMedia component)
- ✅ **Media editing system** (crop, mask, time range for image/audio/video quiz games)
- ✅ **Room status protection** (prevents joins after game started/finished)
- ✅ **Centralized constants** (game timing, Redis keys in shared constants)
- ✅ **3-column edit layout** (list | edit panel | preview - no modal interruptions)
- ✅ **Question-specific duration** (10s-120s per question, plugin support)
- ✅ **Bulk settings modal** (batch time limit configuration for multiple questions)
- ✅ **Mobile filter** (browse page - all/mobile-required/no-mobile games)
- ✅ **Game history system** (view all play records, detailed results, game-specific history)
- ✅ **Profile dropdown with icons** (User, History, Settings, LogOut icons for all menu items)

### Known Issues

- ⚠️ **Media files stored in DB (Base64)** - 개발 편의를 위해 미디어 파일을 DB에 Base64로 임시 저장 중
  - **배포 전 필수 작업**: AWS S3로 마이그레이션 필요
  - DB 용량 급증 위험 (이미지/오디오 파일당 수 MB)
  - 마이그레이션 시 `mediaData` (base64) → `mediaUrl` (S3 URL) 변환 필요
  - 관련 파일: `packages/database/prisma/schema.prisma`, `QuestionMedia.tsx`

**Recently Fixed**:

*2025-11-26 (Latest)*:
- ✅ **Documentation sync** → Removed references to deleted docs (09-game-ideas.md)
- ✅ **Build error fixed** → Added `questionData` to `ScoreCalculationOptions` type
- ✅ **Test sync** → Updated plugin tests (expected 3→5 game types)
- ✅ **Plugin count updated** → Now 5 game types (added liar-game, balance-game)

*2025-11-25*:
- ✅ **Media editing system** → Full implementation (crop, mask, time range playback)
- ✅ DB schema updated → `mediaSettings Json?` field added to Question model
- ✅ Type system extended → MediaSettings types in @xingu/shared

*2025-11-24*:
- ✅ **playCount not incrementing** → Fixed in result-service (games now track play statistics)
- ✅ **Template usage not tracked** → Added sourceGameId (templates show plays from all copies)
- ✅ Type duplication → Single source of truth in @xingu/shared (100% consistency)
- ✅ Unnecessary refetches → React Query cache optimization (90% reduction)
- ✅ Redis blocking operations → SCAN migration (production-safe)
- ✅ Image optimization → Verified Next.js Image usage (already optimized)
- ✅ Backend API response format → Fixed getResultsByGameId to return `{ results, total }` (frontend compatibility)
- ✅ Frontend error handling → Added null/undefined checks for API responses
- ✅ React key prop warning → Changed key from `playerId` to `${playerId}-${rank}` for uniqueness

*2025-11-23*:
- ✅ console.log in production → Replaced with structured logging (Winston)
- ✅ Game update performance → 10x improvement with Upsert pattern
- ✅ WebSocket memory leaks → Redis TTL cleanup instead of setTimeout
- ✅ Unnecessary API calls → Conditional fetching in Browse page
- ✅ Favorite API inefficiency → Integrated isFavorite field (66% API reduction)
- ✅ Slow favorite updates → Optimistic updates with React Query (instant feedback)

---

## 📚 Quick Reference

### Common Commands
```bash
# Development
pnpm dev                          # All services
pnpm dev --filter=web             # Frontend only

# Testing
pnpm test                         # Unit tests
node test-websocket.js            # Backend E2E WebSocket test
pnpm --filter=@xingu/web test:e2e # Browser E2E tests (Playwright)

# Validation
pnpm type-check                   # Type check all
pnpm lint                         # Lint all
pnpm build                        # Build all

# Docker (Databases only)
docker compose up -d postgres redis
```

### Environment Setup
```bash
# 1. Start databases
docker compose up -d postgres redis

# 2. Run migrations
pnpm --filter=@xingu/database db:migrate

# 3. Start services (6 terminals or tmux)
pnpm --filter=@xingu/auth-service dev
pnpm --filter=@xingu/template-service dev
pnpm --filter=@xingu/game-service dev
pnpm --filter=@xingu/room-service dev
pnpm --filter=@xingu/ws-service dev
pnpm --filter=@xingu/result-service dev

# 4. Start frontend
pnpm --filter=@xingu/web dev
```

### 🔐 Production Environment Variables Checklist

**Reference**: [.env.production.example](.env.production.example)

#### Required Configuration (Must Change)

**1. Database (PostgreSQL)**
```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
# Example: postgresql://xingu_prod:STRONG_PASSWORD@db.example.com:5432/xingu_production
```

**2. Redis**
```bash
REDIS_HOST=redis.production.com
REDIS_PORT=6379
REDIS_PASSWORD=STRONG_REDIS_PASSWORD
```

**3. JWT Secret (Must Change!)**
```bash
# Generate with: openssl rand -base64 32
JWT_SECRET=CHANGE_THIS_TO_32_BYTE_RANDOM_STRING
JWT_EXPIRES_IN=15m
```

**4. CORS Origin**
```bash
CORS_ORIGIN=https://your-domain.com  # Actual frontend domain
```

**5. Sentry Error Tracking**
```bash
# Backend Services (same configuration for all services)
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# Frontend (apps/web/.env.production)
NEXT_PUBLIC_SENTRY_DSN=https://yyyyy@yyyyy.ingest.sentry.io/yyyyy  # Browser
SENTRY_DSN=https://zzzzz@zzzzz.ingest.sentry.io/zzzzz              # Server

# Optional: Release tracking
SENTRY_RELEASE=v1.0.0
```

**6. Service Ports (Docker Internal)**
```bash
AUTH_SERVICE_PORT=3001
TEMPLATE_SERVICE_PORT=3002
GAME_SERVICE_PORT=3003
ROOM_SERVICE_PORT=3004
WS_SERVICE_PORT=3005
RESULT_SERVICE_PORT=3006
WEB_PORT=3000
```

**7. Frontend API URLs**
```bash
NEXT_PUBLIC_API_AUTH_URL=https://api.your-domain.com/api/auth
NEXT_PUBLIC_API_TEMPLATE_URL=https://api.your-domain.com/api/templates
NEXT_PUBLIC_API_GAME_URL=https://api.your-domain.com/api/games
NEXT_PUBLIC_API_ROOM_URL=https://api.your-domain.com/api/rooms
NEXT_PUBLIC_API_RESULT_URL=https://api.your-domain.com/api/results
NEXT_PUBLIC_WS_URL=wss://ws.your-domain.com
```

#### Configuration File Locations

- **Backend Services** (each service directory):
  - `apps/auth-service/.env`
  - `apps/template-service/.env`
  - `apps/game-service/.env`
  - `apps/room-service/.env`
  - `apps/ws-service/.env`
  - `apps/result-service/.env`

- **Frontend**:
  - `apps/web/.env.production`

#### Security Checklist

- [ ] Change `JWT_SECRET` (never use default!)
- [ ] Set strong Database password
- [ ] Set Redis password
- [ ] Verify `.env` files are in `.gitignore`
- [ ] Set `NODE_ENV=production` in production
- [ ] Change CORS_ORIGIN to actual domain (no wildcards)
- [ ] Separate Sentry DSN per project (Frontend/Backend)

#### Quick Generation Commands

```bash
# Generate JWT Secret
openssl rand -base64 32

# Generate Random Password (32 chars)
openssl rand -base64 24

# Set .env file permissions (Linux/Mac)
chmod 600 .env
```

### Git Commit Conventions
```
feat: New feature
fix: Bug fix
refactor: Code refactoring
test: Add/update tests
docs: Documentation
style: Formatting
chore: Build/config
```

---

## 📍 Next Steps

### Immediate Tasks

1. ✅ ~~Build Results Page (final leaderboard)~~ - Integrated in Live Game page
2. ✅ ~~E2E testing with real participants (browser)~~ - Playwright tests complete (18 tests)
3. ✅ ~~Production build verification (Next.js 16)~~ - All 9 packages build successfully
4. ✅ ~~Performance optimization (Lighthouse >90)~~ - Compression, image optimization, SEO complete

### Phase 1 Launch Checklist
- [ ] SSL certificate (Let's Encrypt)
- [x] Sentry setup (error tracking) - ✅ All 7 services complete (Frontend + 6 backend services)
- [ ] UptimeRobot (service monitoring)
- [x] Production .env files - `.env.production.example` created with full documentation
- [ ] Database backup script (daily)
- [x] 404/500 error pages
- [ ] GitHub Actions CI
- [x] Lighthouse audit on production build (✅ 98/100 Performance, 95/100 Accessibility, 96/100 Best Practices, 100/100 SEO)
- [ ] **AWS S3 media migration** - DB Base64 저장 → S3 URL 방식으로 변경 (필수!)

---

## 📄 Documentation Structure

```
xingu/
├── CLAUDE.md                    # 🤖 AI-only guide (this file)
├── README.md                    # 👋 User Quick Start
├── SENTRY_COMPLETION.md         # 📋 Sentry integration completion checklist
├── .env.production.example      # 🔐 Production environment template
│
└── docs/
    ├── 00-INDEX.md              # 📌 Documentation guide map (starting point)
    │
    ├── 01-overview.md           # 📖 Project overview
    ├── 02-ia.md                 # 🗂️ Information Architecture
    ├── 03-prd.md                # 📋 Product Requirements
    ├── 04-architecture.md       # 🏗️ System Architecture
    ├── 05-design-guide.md       # 🎨 Design System
    ├── 06-development-guide.md  # 💻 Development Guide & Conventions
    ├── 07-deployment-guide.md   # 🚀 Deployment guide (NEW)
    └── 08-sentry-setup.md       # 🐛 Sentry setup guide (NEW)
```

---

## 📚 Detailed Documentation (Required for Development)

### Always Check During Development
- **[docs/02-ia.md](docs/02-ia.md)** - UI structure, screen flows (Frontend required)
- **[docs/03-prd.md](docs/03-prd.md)** - API specs, requirements (Backend/Frontend required)
- **[docs/05-design-guide.md](docs/05-design-guide.md)** - Design system (Frontend required)
- **[docs/06-development-guide.md](docs/06-development-guide.md)** - Coding conventions, Recent Changes

### Overall Understanding
- **[docs/01-overview.md](docs/01-overview.md)** - Project vision, business, tech stack
- **[docs/04-architecture.md](docs/04-architecture.md)** - System structure, DB schema, diagrams

### Quick Navigation
- **[docs/00-INDEX.md](docs/00-INDEX.md)** - 📌 All documentation guide (which docs to read when)

---

## 🎓 Remember

**Xingu is a project that looks to the distant future.**

- **Scalability > Speed**: Designing for scalability is more important than quick fixes
- **Don't Fear Refactoring**: If you find a bad structure, refactor it immediately
- **Zero Technical Debt**: "We'll fix it later" is a banned phrase
- **Quality > Speed**: Doing it right is more important than doing it fast

**Always ask yourself: "Will this structure work if it scales 10x?"**
