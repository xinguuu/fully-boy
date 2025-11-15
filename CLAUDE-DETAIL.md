# Xingu Project - Detailed Documentation

> **이 문서는 상세한 코딩 컨벤션, 프로덕션 배포 전략, 변경 이력을 포함합니다**
> **핵심 가이드는**: [CLAUDE.md](./CLAUDE.md) 참조

---

## 📝 Detailed Coding Conventions

### Component Structure Order

```typescript
// 1. Imports
import { useState } from 'react';
import type { User } from '@xingu/shared';

// 2. Types/Interfaces
interface UserProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

// 3. Constants
const MAX_NAME_LENGTH = 50;

// 4. Main Component
export function UserProfile({ user, onUpdate }: UserProfileProps) {
  // State
  const [isEditing, setIsEditing] = useState(false);

  // Hooks
  const { mutate } = useUpdateUser();

  // Handlers
  const handleSubmit = () => {};

  // Render
  return <div>{/* JSX */}</div>;
}

// 5. Sub Components
function UserAvatar({ src }: { src: string }) {
  return <img src={src} alt="avatar" />;
}

// 6. Helper Functions
function validateUserName(name: string): boolean {
  return name.length <= MAX_NAME_LENGTH;
}
```

### Detailed Comment Guidelines

**IMPORTANT: DO NOT ADD ANY COMMENTS unless explicitly asked or logic is genuinely complex**

```typescript
// ❌ REDUNDANT - function name is clear
// Create user
function createUser() {}

// ❌ REDUNDANT - obvious from code
const isLoading = false; // Loading state

// ✅ GOOD - complex business logic explained
/**
 * Get existing tags or create new ones, handling duplicates and validation.
 * Tags are case-insensitive and normalized before storage.
 *
 * @param tagNames - List of tag names to process
 * @returns Promise resolving to Tag objects
 * @throws {ValidationError} If tag name exceeds 50 characters
 */
async getOrCreateTags(tagNames: string[]): Promise<Tag[]> {
  // Normalize and deduplicate tags
  const normalized = [...new Set(tagNames.map(name => name.toLowerCase().trim()))];
  // ... complex logic
}
```

**When Comments ARE Valuable:**
- Complex business logic requiring explanation
- Method parameters with specific validation rules
- Return value details not obvious from types
- Important side effects or state changes

---

## 🔄 Next.js 15 + React 19 Best Practices

### Server Components (Default)

```typescript
// app/users/page.tsx
export default async function UsersPage() {
  const users = await fetchUsers(); // Direct fetch on server
  return <UserList users={users} />;
}
```

### Client Components (Only When Necessary)

```typescript
'use client';  // Explicit declaration

// Use cases:
// - useState, useEffect, React hooks
// - Browser APIs (localStorage, etc)
// - Event listeners
// - Context usage
```

### Data Fetching

```typescript
// ✅ Fetch in Server Component
const data = await fetch('https://api.example.com', {
  next: { revalidate: 3600 } // ISR
});

// ✅ Server Actions
'use server';
export async function createUser(formData: FormData) {
  // ...
}
```

### Error Handling & Loading

```typescript
// app/users/error.tsx - Error boundary
'use client';
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}

// app/users/loading.tsx - Loading state
export default function Loading() {
  return <UsersSkeleton />;
}

// app/users/not-found.tsx - 404 page
export default function NotFound() {
  return <div>User not found</div>;
}
```

---

## 🚀 Production Readiness (Staged Growth)

> **철학**: "Perfect is the enemy of good" - 완벽한 인프라보다 **안정적으로 동작하는 서비스**를 먼저, **사용자 증가에 따라 점진적 확장**

---

### 📍 Phase 1: Launch Ready (지금 - 사용자 0~100명)

**목표**: 버그 없이 안정적으로 동작하고, 문제 발생시 빠르게 알 수 있음

#### Must-Have ✅

**Security Basics:**
- HTTPS only (Let's Encrypt 무료 인증서)
- JWT authentication (access 15min, refresh 7 days)
- Password hashing (bcrypt cost 12)
- Rate limiting (100 req/min per IP)
- Input validation (Zod schemas 전 엔드포인트)
- CORS whitelist (production domain only)

**Simple Deployment:**
- Docker Compose (단일 서버 or VPS)
- 환경변수 관리 (.env files)
- GitHub Actions (PR마다 build + test 자동 실행)
- 수동 배포 (ssh + docker-compose up -d)

**Basic Monitoring:**
- **Sentry** (에러 트래킹 - 무료 플랜 5,000 events/월)
- **UptimeRobot** (서비스 다운 알림 - 무료)
- **Daily DB backup** (cron job → S3/Dropbox)
- 서버 디스크/메모리 알림 (hosting provider 기본 기능)

**Performance Essentials:**
- Next.js production build (자동 최적화)
- Redis caching (template list 1hr TTL)
- Database indexes (foreign keys + 자주 조회 컬럼)
- 이미지 최적화 (WebP, Next.js Image)

#### Nice-to-Have (나중에)
- Nginx reverse proxy → Docker Compose로도 충분
- Grafana dashboard → 트래픽 생기면
- CDN (CloudFlare) → 사용자 늘어나면

**예상 비용**: $20~50/월 (VPS + DB hosting)

---

### 📍 Phase 2: Growth (사용자 100~1,000명)

**트리거**: 동시 접속 50명 이상 or 응답 속도 500ms 초과

**Upgrade:**
- 🔄 단일 서버 → **수평 확장** (web 2 replicas)
- 🔄 SQLite/Supabase → **전용 PostgreSQL** (managed service)
- 🔄 Redis 단일 → **Redis 2 replicas**
- 🔄 CDN 추가 (CloudFlare 무료 플랜)
- 🔄 Prometheus + Grafana (기본 메트릭)

**예상 비용**: $100~200/월

---

### 📍 Phase 3: Scale Up (사용자 1,000~10,000명)

**트리거**: 서버 비용이 매출 30% 초과 or 주간 다운타임 발생

**Upgrade:**
- 🔄 Docker Compose → **Kubernetes** (GKE/EKS)
- 🔄 Auto-scaling (CPU/Memory 기반)
- 🔄 Multi-AZ deployment
- 🔄 APM (New Relic/Datadog)
- 🔄 99.9% SLA target

**예상 비용**: $500~1,000/월

---

### 💡 Anti-Patterns (피할 것)

**❌ 초기에 하지 말 것:**
- Kubernetes 도입 (복잡도 10배, 사용자 없으면 의미 없음)
- Service Mesh (트래픽 1000 RPS 이하면 불필요)
- Multi-region (한국만 타겟이면 서울 1개 region으로 충분)
- 100개 메트릭 추적 (핵심만: 에러율, 응답속도, 사용자수)
- 완벽한 CI/CD (주 1회 배포면 수동도 OK)

**✅ 집중할 것:**
- 버그 없는 코드 (테스트 >80% 커버리지)
- 빠른 응답 (API <500ms)
- 명확한 에러 메시지
- 10분 내 배포 가능한 프로세스
- 핵심 3가지 메트릭 (에러, 속도, 사용자)

---

## 🔐 Security Requirements (All Phases)

### Authentication & Authorization
- **JWT Expiry**: Access token 15 min, Refresh token 7 days
- **Password Policy**: Min 8 chars, uppercase + lowercase + number + special char
- **Rate Limiting**: 100 req/min per IP (API), 5 req/min (auth endpoints)
- **Session Management**: Redis-based with auto-expiry
- **Multi-factor Authentication (MFA)**: TOTP-based (optional for users)

### Data Protection
- **Encryption at Rest**: AES-256 for sensitive data (PII, passwords)
- **Encryption in Transit**: TLS 1.3 only (disable TLS 1.2)
- **Password Hashing**: bcrypt with cost factor 12
- **PII Masking**: Mask emails (a***@example.com), phone numbers (***-****-1234)
- **Data Retention**: Delete inactive accounts after 2 years (GDPR compliance)

### API Security
- **CORS**: Whitelist only production domains
- **CSRF Protection**: SameSite cookies + CSRF tokens
- **SQL Injection**: Parameterized queries only (Prisma ORM enforced)
- **XSS Protection**: Content Security Policy (CSP) headers
- **Input Validation**: Zod schemas for all API endpoints
- **Output Sanitization**: DOMPurify for user-generated content

### Infrastructure Security
- **Container Scanning**: Trivy/Clair before deployment (no CRITICAL vulnerabilities)
- **Secret Rotation**: Rotate secrets every 90 days
- **Least Privilege**: Services run as non-root users
- **Network Policies**: Deny all by default, allow only necessary traffic
- **Audit Logging**: Log all authentication, authorization, and data changes

### Compliance
- **GDPR**: Right to erasure, data portability, consent management
- **개인정보보호법 (Korea)**: Data minimization, consent, breach notification
- **OWASP Top 10**: Regular security audits and penetration testing

---

## 🛡️ Disaster Recovery & Backup

### Backup Strategy
- **Database Backups**: Daily full backup + hourly incremental
- **Backup Retention**: 30 days (rolling window)
- **Backup Location**: Multi-region (primary + secondary)
- **Backup Encryption**: AES-256
- **Restore Testing**: Monthly restore drills

### High Availability
- **Multi-AZ Deployment**: Services across 3 availability zones
- **Database Replication**: Primary + 2 read replicas (different AZs)
- **Redis Replication**: 1 primary + 2 replicas
- **Failover Time**: < 60 seconds (automated)

### Disaster Recovery
- **RTO (Recovery Time Objective)**: < 4 hours
- **RPO (Recovery Point Objective)**: < 15 minutes (data loss tolerance)
- **DR Site**: Separate region (cold standby)
- **Failover Runbook**: Documented and tested quarterly

---

## 📊 Monitoring & Alerting (Production)

### Health Checks
- **Liveness Probe**: `/health/live` (is service running?)
- **Readiness Probe**: `/health/ready` (can service accept traffic?)
- **Startup Probe**: `/health/startup` (has service initialized?)
- **Probe Interval**: 10 seconds
- **Probe Timeout**: 5 seconds

### Metrics to Monitor
- **Golden Signals**: Latency, Traffic, Errors, Saturation
- **Service Metrics**: Request rate, error rate, response time (P50/P95/P99)
- **Infrastructure Metrics**: CPU, Memory, Disk I/O, Network I/O
- **Database Metrics**: Connections, query time, deadlocks, replication lag
- **Cache Metrics**: Hit rate, miss rate, evictions, memory usage
- **Business Metrics**: Active users, games played, error rate by feature

### Alerting Rules
- **P0 (Critical)**: Service down, error rate > 5%, p95 latency > 1s
- **P1 (High)**: Error rate > 2%, p95 latency > 500ms, disk > 80%
- **P2 (Medium)**: Cache hit rate < 70%, CPU > 80%, memory > 85%
- **Alert Fatigue Prevention**: Max 3 alerts per hour, auto-resolve after fix

### On-Call Rotation
- **Primary On-Call**: 24/7 coverage
- **Secondary On-Call**: Escalation after 15 minutes
- **Post-Mortem**: Required for all P0 incidents within 48 hours

---

## 💾 Database Optimization (Production)

### Schema Design
- **Indexing**: All foreign keys + frequently queried columns
- **Partitioning**: Time-based partitioning for `game_results` table (monthly)
- **Denormalization**: Leaderboard cached in Redis (refresh every 5 min)
- **Archiving**: Move old data (> 1 year) to cold storage

### Query Optimization
- **N+1 Prevention**: Use `include` in Prisma queries
- **Query Plan Analysis**: `EXPLAIN ANALYZE` for slow queries (> 100ms)
- **Connection Pooling**: PgBouncer (transaction mode)
- **Read/Write Splitting**: Reads to replicas, writes to primary

### Database Maintenance
- **Vacuum**: Auto-vacuum enabled (analyze threshold 50 rows)
- **Index Rebuild**: Monthly for heavily updated tables
- **Statistics Update**: Daily `ANALYZE` runs
- **Schema Migrations**: Zero-downtime with blue-green deployment

---

## 📦 Caching Strategy

### Cache Layers
1. **CDN Cache**: Static assets (images, CSS, JS) - 1 year TTL
2. **Browser Cache**: API responses (Cache-Control headers) - 5 min
3. **Redis Cache**:
   - Template list: 1 hour TTL
   - User sessions: 7 days TTL
   - Game state: 2 hours TTL (room expiry)
   - Leaderboard: 5 minutes TTL

### Cache Invalidation
- **Write-Through**: Update cache immediately after DB write
- **TTL-based**: Automatic expiry based on data freshness requirements
- **Tag-based**: Invalidate related cache keys on update
- **Stale-While-Revalidate**: Serve stale data while fetching fresh

### Cache Warming
- **Popular Templates**: Pre-load top 20 templates on deployment
- **User Sessions**: Keep active sessions in memory (LRU eviction)

---

## 🚢 Deployment Strategy

### CI/CD Pipeline
1. **Code Push** → GitHub
2. **Pre-commit Hooks**: Lint, type-check, format
3. **CI Checks**: Build, test, security scan (Snyk/Trivy)
4. **Merge to main** → Auto-deploy to staging
5. **Manual Approval** → Deploy to production
6. **Post-deploy**: Smoke tests, health checks

### Deployment Patterns
- **Blue-Green Deployment**: Zero-downtime deployments
- **Canary Releases**: 10% traffic → 50% → 100% (15 min intervals)
- **Rollback**: Instant rollback on error rate > 1%
- **Feature Flags**: LaunchDarkly / Flagsmith for gradual rollouts

### Release Schedule
- **Hotfixes**: Immediate (critical bugs only)
- **Minor Releases**: Weekly (Friday 2pm KST)
- **Major Releases**: Monthly (first Friday of month)
- **Maintenance Window**: Saturday 2am-4am KST (minimal traffic)

---

## 📚 API Versioning & Documentation

### Versioning Strategy
- **URL Versioning**: `/api/v1/games`, `/api/v2/games`
- **Version Support**: Current + previous version (6 months)
- **Deprecation Notice**: 3 months before sunsetting
- **Breaking Changes**: Major version bump only

### API Documentation
- **OpenAPI/Swagger**: Auto-generated from code
- **Interactive Docs**: Swagger UI at `/api/docs`
- **Changelog**: Detailed release notes for each version
- **Client SDKs**: Auto-generated TypeScript SDK

---

## ⚠️ Error Handling Strategy

### Custom Error Classes (packages/shared/errors/)

```typescript
// Base error
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Specific errors
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 'AUTH_ERROR', 401);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}
```

### Error Handling Rules

#### ✅ DO
- Use try-catch for all async functions
- Throw errors with clear messages
- Display user-friendly error messages
- Log errors in development (Sentry in production)
- Handle predictable errors explicitly

#### ❌ DON'T
- Ignore errors or use empty catch blocks
- Include sensitive information in error messages
- Expose technical errors to users
- Handle errors only with console.log

---

## 🐳 Docker Development

### Local Development (Without Docker)

```bash
pnpm install
pnpm dev              # All services
pnpm dev --filter=web # Specific service
```

### Docker Development

```bash
docker-compose up        # Start all containers
docker-compose up --build # Build and start
docker-compose down      # Stop all
```

### Service Communication
- **Internal (Docker)**: Use service names `http://auth-service:3001`
- **External (Browser)**: Through Nginx `http://localhost/api/auth`

---

## 📋 Recent Changes

### 2025-11-15: Documentation Sync with Codebase 🔄

- **Status**: ✅ Complete
- **Summary**: Updated CLAUDE.md to reflect actual implementation state and correct version numbers
- **Changes**:
  1. ✅ **Technology Stack**: Updated Next.js 15 → 16.0.3, React 19 → 19.2.0, added exact version numbers
  2. ✅ **Frontend Pages**: Clarified that Results page is integrated into Live Game page (not separate)
  3. ✅ **Known Issues**: Updated from "Next.js 15 + React 19 build issue" to "Next.js 16 production build optimization"
  4. ✅ **Next Steps**: Marked Results page as complete, added production build verification task
  5. ✅ **Runtime Requirements**: Added Node.js 24.0.0+ to both Frontend and Backend sections
  6. ✅ **Monorepo Tools**: Updated pnpm 9.0.0+ → 10.21.0, Turborepo → 2.3.3
  7. ✅ **Login/Signup Pages**: Added to Frontend Pages table (was missing)
- **Key Findings**:
  - All frontend pages are 100% complete (8/8 including integrated results)
  - Backend services fully implemented with test coverage
  - Project uses Next.js 16 (not 15 as documented)
  - All services located in `apps/` directory (no `services/` folder)

---

### 2025-11-15: Documentation Restructuring 📄

- **Status**: ✅ Complete
- **Summary**: Split CLAUDE.md into core guide (350 lines) and detailed documentation for better readability
- **Changes**:
  1. ✅ **Created CLAUDE-DETAIL.md**: Moved all detailed content (coding conventions, production readiness, recent changes)
  2. ✅ **Simplified CLAUDE.md**: Kept only essentials (architecture, critical rules, current status, quick reference)
  3. ✅ **Clear Documentation Structure**: Core → Detail → Docs folder pattern
- **Benefits**:
  - ✨ **Reduced cognitive load**: AI can focus on core rules without information overload
  - ✨ **Better organization**: Detail available when needed via cross-reference
  - ✨ **Faster onboarding**: New contributors see essentials first
  - ✨ **Maintainability**: Changes log stays in DETAIL, core stays stable

**Pattern Established**:
- CLAUDE.md = 핵심 (What you MUST know)
- CLAUDE-DETAIL.md = 상세 (When you need more context)

---

### 2025-11-15: Session Management System - Robust Game Session Recovery! 🔄

- **Status**: ✅ Complete
- **Summary**: Implemented production-grade session management with automatic recovery for tab close, page refresh, and browser back scenarios
- **Solution**: Redis-based session persistence + localStorage sessionId + WebSocket session restoration

**Key Features**:
- ✨ **Tab close recovery**: Users can close tab and rejoin without losing progress
- ✨ **Page refresh**: Game state persists across page reloads
- ✨ **Back navigation**: Navigating back from game doesn't break session
- ✨ **Cross-tab sync**: sessionId in localStorage works across browser tabs

**Technical Implementation**:
- **Redis Keys**: `participant:session:{sessionId}` (2-hour TTL)
- **localStorage**: `room_{pin}_sessionId` (persists across tabs)
- **WebSocket Event**: `SESSION_RESTORED` (new event added)

---

### 2025-11-15: Game Start Flow Fixed - WebSocket Organizer Auth! 🎮

- **Status**: ✅ Complete
- **Problems Fixed**:
  1. **NOT_ORGANIZER Error**: Organizer couldn't start games (checked WebSocket player list instead of JWT)
  2. **NO_PARTICIPANTS Error**: Required min 2 WebSocket connections (but participants joined via REST API)
  3. **Loading State**: Game page showed nickname form while WebSocket was connecting

**Solution**: JWT-based organizer verification + removed participant count validation + auto-start first question

---

### 2025-11-15: Automatic Token Refresh - Seamless Authentication UX! 🔄

- **Status**: ✅ Complete
- **Problem**: Users were logged out every 15 minutes (access token expiration)
- **Solution**: Automatic token refresh with retry mechanism and race condition prevention

**User Experience**:
- ✨ No more forced logouts (7-day refresh token)
- ✨ Seamless renewal (background refresh)
- ✨ Smart fallback (login only when refresh fails)

---

### 2025-11-15: E2E Testing Complete - All Systems Production Ready! 🎉

- **Status**: ✅ Complete (10/10 tests - 100% success)
- **Summary**: Comprehensive automated E2E tests covering entire platform
- **Test Results**: 10/10 passing (Infrastructure, Auth, Templates, Games, Rooms, WebSocket, Gameplay, Scoring)

**Bugs Fixed**:
1. WebSocket JWT Authentication (`decoded.id` → `decoded.sub`)
2. Missing Middleware Export (AuthenticatedUser type)

---

### 2025-11-15: Live Game WebSocket Integration Complete! 🎮

- **Status**: ✅ Complete
- **Files Created**: 5 files (948 lines total)
- **Features**: Real-time gameplay, Timer component, Organizer/Participant views, WebSocket events

---

### 2025-11-14: Room API Integration Complete! 🚀

- **Status**: ✅ Complete (with TDD)
- **Features**: Room creation, participant management, waiting room page, real-time polling

---

### 2025-11-14: Edit Screen Complete - Game Customization Ready! ✏️

- **Status**: ✅ Complete (with TDD)
- **Features**: Modal-based UX, Draft mode, Question editing, Settings management
- **Tests**: 11 unit tests passing

---

### 2025-11-13: Backend 100% Complete - Production Ready! 🎉

- **Status**: ✅ Complete
- **Summary**: All 6 backend services healthy, 138 unit tests + 10 E2E tests passing
- **Services**: auth, template, game, room, ws, result (all 100% complete)

---

### 2025-11-13: Frontend Foundation Complete! 🎨

- **Status**: ✅ Complete
- **Features**: API client, auth system, state management, UI components, Xingu design system
- **Stack**: Next.js 15 + React 19 + TypeScript + TanStack Query + Zustand + Shadcn UI

---

## 🌐 Language Policy

**All code, documentation, and services use English by default.**

This includes:
- Code comments and documentation
- Variable, function, class, and file names
- API responses and error messages
- Git commit messages
- Test data

**Exception**: User-facing content supports multiple languages through i18n.

---

**Last Updated**: 2025-11-15
**Maintained By**: Claude AI Assistant
**See Also**: [CLAUDE.md](./CLAUDE.md) (Core Guide)
