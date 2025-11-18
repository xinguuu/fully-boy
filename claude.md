# Xingu Project - Claude AI Assistant Guide

> **핵심 가이드**: 프로젝트 정체성, 필수 규칙, 현재 상태만 포함
> **상세 내용**: [docs/06-development-guide.md](docs/06-development-guide.md) 참조
> **전체 문서**: [docs/00-INDEX.md](docs/00-INDEX.md) (문서 가이드 맵)

---

## 📌 Project Overview

**Xingu**는 Kahoot 스타일의 한국형 파티 게임 플랫폼입니다.

### 핵심 차별점
- **게임 프레임워크 제공**: 템플릿 커스터마이징만으로 5분 내 게임 생성
- **유연한 참여 모드**: 모바일 필수 모드 + MC 모드 (폰 없이 진행)
- **트렌디한 컨텐츠**: 한국 예능, SNS 트렌드, 밈 중심
- **간편한 커스터마이징**: 질문/컨텐츠만 수정, 프레임워크는 제공됨

---

## 🏗️ Architecture

**MSA (Microservice Architecture)**: 6개 백엔드 서비스 + Frontend + 3 Infrastructure
**상세 다이어그램**: [docs/04-architecture.md](docs/04-architecture.md)

### 핵심 구조
- **Frontend**: Next.js 16 (App Router) + React 19
- **Backend**: 6개 서비스 (NestJS + Express + Socket.io)
- **Database**: PostgreSQL 17 + Redis
- **Infra**: Docker + Nginx + Turborepo monorepo

**→ 상세 정보**: [docs/01-overview.md](docs/01-overview.md#technology-stack) | [docs/04-architecture.md](docs/04-architecture.md)

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

### Code Quality
5. **No `any` type** (use `unknown`)
6. **No `console.log` in production** (use structured logging)
7. **No hardcoding** (use env vars or constants)
8. **No files over 500 lines** (must split)
9. **No missing async error handling**
10. **No redundant comments** (complex logic only)

### Frontend Rules
11. **ALWAYS follow [docs/02-ia.md](docs/02-ia.md)** (UI structure, user flows)
12. **ALWAYS follow [docs/05-design-guide.md](docs/05-design-guide.md)** (colors, typography, styling)
13. **ALWAYS check backend code when developing frontend APIs**:
    - Read backend DTO schemas
    - Match request/response types exactly
    - Frontend validation must match backend validation

### Backend Rules
14. **ALWAYS follow [docs/03-prd.md](docs/03-prd.md)** (API specs, business requirements):
    - Check API endpoints definition
    - Verify request/response schemas
    - Follow business logic requirements

### Deployment Rules
15. **No deployment without passing ALL checks**:
    - ✅ Type-check (0 errors)
    - ✅ Lint (0 warnings)
    - ✅ Unit tests (>80% coverage)
    - ✅ E2E tests (critical flows)
    - ✅ Security scan (no CRITICAL vulnerabilities)

### Security Rules
16. **No production secrets in code** (use secret management)
17. **No unencrypted PII** (encrypt at rest and in transit)
18. **No single point of failure** (min 2 replicas)
19. **No skipping error tracking** (Sentry mandatory)

### Accessibility & Standards
20. **No ignoring accessibility** (WCAG 2.1 AA compliance)
21. **Follow language policy**: Code/docs in English, UI in Korean (i18n)

---

## 📝 Coding Conventions (Summary)

**상세 내용**: [docs/06-development-guide.md](docs/06-development-guide.md#coding-conventions)

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
   - UI 흐름/화면 순서 변경 시 → [docs/02-ia.md](docs/02-ia.md) 업데이트
   - 디자인/스타일 변경 시 → [docs/05-design-guide.md](docs/05-design-guide.md) 업데이트
   - API 스펙 변경 시 → [docs/03-prd.md](docs/03-prd.md) 업데이트
5. **Update [docs/06-development-guide.md](docs/06-development-guide.md) "Recent Changes"** (모든 작업 완료 시)
6. **Update CLAUDE.md "Current Status" / "Next Steps"** (중요한 프로젝트 변경 시)
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
- **Backend**: ✅ **100% Complete** (138 unit tests + 10 E2E tests passing)
- **Frontend**: ✅ **Foundation + Core Pages Complete**
- **Testing**: ✅ 138 backend unit tests + 10 backend E2E tests + 18 browser E2E tests (Playwright)

### Backend Services (100% Complete)

| Service | API | Tests | Status |
|---------|-----|-------|--------|
| auth-service | ✅ | 17 tests ✅ | 100% |
| template-service | ✅ | 18 tests ✅ | 100% |
| game-service | ✅ | 26 tests ✅ | 100% |
| room-service | ✅ | 28 tests ✅ | 100% |
| ws-service | ✅ | 28 tests ✅ | 100% |
| result-service | ✅ | 21 tests ✅ | 100% |

**Total: 138 unit tests + 10 E2E tests passing** 🎉

### Frontend Pages

| Page | Status | Details |
|------|--------|---------|
| Homepage (PIN Entry) | ✅ Complete | Kahoot-style, Korean text |
| Login / Signup | ✅ Complete | JWT auth, token refresh |
| Browse (둘러보기) | ✅ Complete | 2 tabs, filters, favorites |
| Edit Screen (편집) | ✅ Complete | Modal-based UX, draft mode |
| Join Page (입장) | ✅ Complete | `/room/[pin]` - Nickname entry |
| Waiting Room (대기실) | ✅ Complete | PIN display, real-time participants |
| Live Game (게임 진행) | ✅ Complete | WebSocket integration, real-time scoring |
| **Game Results (결과)** | ✅ Complete | **Integrated in Live Game page** - Final leaderboard |

### What's Working
- ✅ All 6 backend services (local dev ready)
- ✅ PostgreSQL + Redis (Docker containers)
- ✅ JWT authentication + token refresh
- ✅ WebSocket real-time gameplay
- ✅ Session management (tab close recovery)
- ✅ Frontend auth (login/signup working)
- ✅ Next.js dev server (http://localhost:3000)
- ✅ Browser E2E testing (Playwright with 18 tests)
- ✅ **Production build** (All 9 packages build successfully)
- ✅ **Performance optimizations** (compression, image optimization, SEO)
- ✅ **Question intro screen** (2-second "1/3" display before each question)
- ✅ **Multiple question types** (multiple-choice, true-false)
- ✅ **Template questions loading** (creates copies from template)

### Known Issues

- None currently 🎉

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
- [ ] Sentry setup (error tracking)
- [ ] UptimeRobot (service monitoring)
- [ ] Production .env files
- [ ] Database backup script (daily)
- [x] 404/500 error pages
- [ ] GitHub Actions CI
- [ ] Lighthouse audit on production build (target: >90)

---

## 📄 Documentation Structure

```
xingu/
├── CLAUDE.md                    # 🤖 AI 전용 (이 파일)
├── README.md                    # 👋 사용자용 Quick Start
│
└── docs/
    ├── 00-INDEX.md              # 📌 문서 가이드 맵 (시작점)
    │
    ├── 01-overview.md           # 📖 프로젝트 전체 개요
    ├── 02-ia.md                 # 🗂️ Information Architecture
    ├── 03-prd.md                # 📋 Product Requirements
    ├── 04-architecture.md       # 🏗️ 시스템 아키텍처
    ├── 05-design-guide.md       # 🎨 디자인 시스템
    └── 06-development-guide.md  # 💻 개발 가이드 & 컨벤션
```

---

## 📚 상세 문서 (개발 시 필수 참조)

### 개발 시 항상 확인
- **[docs/02-ia.md](docs/02-ia.md)** - UI 구조, 화면별 플로우 (Frontend 필수)
- **[docs/03-prd.md](docs/03-prd.md)** - API 스펙, 요구사항 (Backend/Frontend 필수)
- **[docs/05-design-guide.md](docs/05-design-guide.md)** - 디자인 시스템 (Frontend 필수)
- **[docs/06-development-guide.md](docs/06-development-guide.md)** - 코딩 컨벤션, Recent Changes

### 전체 이해
- **[docs/01-overview.md](docs/01-overview.md)** - 프로젝트 비전, 비즈니스, 기술 스택
- **[docs/04-architecture.md](docs/04-architecture.md)** - 시스템 구조, DB 스키마, 다이어그램

### 빠른 탐색
- **[docs/00-INDEX.md](docs/00-INDEX.md)** - 📌 모든 문서 가이드 (어떤 문서를 언제 봐야 하는지)

---

**Remember**: Quality over Speed. 올바르게 작성하는 것이 빠르게 작성하는 것보다 중요합니다.
