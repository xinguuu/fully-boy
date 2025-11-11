# Xingu Project - Claude AI Assistant Guide

## 📌 Project Overview

**Xingu** is a Korean-style party game platform, similar to Kahoot but focused on Korean entertainment content, memes, and flexible participation modes.

### Core Concept
> **"Kahoot's convenience + Korean entertainment/meme game content"**

### Key Differentiators
- **Game Framework Provider**: Templates ready to customize (5-min setup vs 30-min from scratch)
- **Flexible Participation**: Mobile-required mode (like Kahoot) + MC mode (phone-free)
- **Trendy Content**: Korean entertainment shows, SNS trends, memes
- **Easy Customization**: Modify questions/content only, framework is ready

---

## 🏗️ Architecture

### Microservice Architecture (MSA) + Docker

**7 Containers:**
1. **nginx** - Reverse proxy, load balancing
2. **postgres** - Main database (users, games, rooms)
3. **redis** - Session sharing, real-time state
4. **web** - Next.js frontend (SSR)
5. **auth-service** - NestJS (authentication, users)
6. **game-service** - Express (games, rooms, templates)
7. **ws-service** - Socket.io (real-time WebSocket)

### Service Communication
```
Client (Browser)
    ↓
Nginx (Port 80)
    ↓
┌────────────┬─────────────┬──────────────┐
│    Web     │Auth Service │Game Service  │
│  (Next.js) │  (NestJS)   │  (Express)   │
└────┬───────┴──────┬──────┴──────┬───────┘
     │              │             │
     └──────────────┴─────────────┴────→ PostgreSQL
     │              │             │
     └──────────────┴─────────────┴────→ Redis (Session)
     │
     └────────────────────────────────→ WS Service (Socket.io)
                                              ↓
                                           Redis (Pub/Sub)
```

### Monorepo Structure (Turborepo)
```
xingu/
├── apps/
│   ├── web/                    # Next.js 15 Frontend
│   ├── auth-service/           # NestJS Auth Service
│   ├── game-service/           # Express Game Service
│   └── ws-service/             # Socket.io WebSocket
├── packages/
│   ├── shared/                 # Types, Utils, Constants, Zod schemas
│   ├── database/               # Shared Prisma Schema
│   └── config/                 # ESLint, TypeScript configs
├── infrastructure/
│   ├── nginx/                  # Reverse Proxy
│   ├── postgres/               # Database
│   └── redis/                  # Session Store
└── docs/                       # Project documentation
```

---

## 💻 Technology Stack

### Frontend (apps/web)
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI + Radix UI
- **State**: Zustand, TanStack Query
- **Form**: react-hook-form + Zod
- **Testing**: Vitest + Playwright

### Backend (Microservices)
- **Auth Service**: NestJS + JWT + Redis sessions
- **Game Service**: Express + Zod validation
- **WS Service**: Socket.io + Redis Pub/Sub
- **Database**: PostgreSQL + Prisma ORM (shared schema)
- **Session Store**: Redis

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Docker Compose (dev) / Kubernetes (prod)
- **Reverse Proxy**: Nginx
- **Monorepo**: Turborepo + npm workspaces

---

## 🎯 Development Workflow

### 1. MANDATORY: Task-Driven Development
- **Always create TODOs first** before starting work
- Break large tasks into smaller units (minimum 2 TODOs)
- Each TODO must be independently testable
- Check off TODOs immediately after completion
- Specify affected apps/packages in monorepo

### 2. TDD (Test-Driven Development) - STRICT
1. **🔴 RED**: Write a failing test first
2. **🟢 GREEN**: Write minimal code to pass the test
3. **🔵 REFACTOR**: Improve and optimize the code

### 3. Automated Validation (MANDATORY after writing code)

#### Full Monorepo Validation
```bash
npm run type-check  # Type check everything
npm run lint        # Lint everything
npm run test        # Unit tests
npm run build       # Build all (Turborepo caching)
npm run test:e2e    # E2E tests
```

#### Specific App Validation (Fast Iteration)
```bash
npm run build --filter=web
npm run test --filter=auth-service
npm run test --filter=game-service
```

### 4. SOLID Principles (TypeScript/React)
- **SRP**: One component/function = one responsibility
- **OCP**: Open for extension, closed for modification
- **LSP**: Ensure type safety with interfaces
- **ISP**: Small, specific interfaces
- **DIP**: Depend on abstractions, use dependency injection

---

## 📝 Coding Conventions

### File/Folder Naming
```
✅ GOOD:
- Components: Button.tsx, UserProfile.tsx (PascalCase)
- Utils: formatDate.ts, calculateTotal.ts (camelCase)
- Hooks: useAuth.ts, useUserData.ts (camelCase + use prefix)
- Types: user.types.ts, api.types.ts (camelCase + .types)
- Constants: API_ENDPOINTS.ts, USER_ROLES.ts (UPPER_SNAKE_CASE)
- Folders: user-profile/, auth-wizard/ (kebab-case)
- Tests: Button.test.tsx, formatDate.test.ts (.test)

❌ BAD:
- button.tsx (should be PascalCase)
- FormatDate.ts (utils should be camelCase)
- Auth.hook.ts (missing use prefix)
```

### Variable/Function Naming
```typescript
// ✅ GOOD - Clear and meaningful
const isUserAuthenticated = useAuth();
const hasPermission = checkPermission();
const fetchUserData = async () => {};

// ❌ BAD - Unclear or abbreviated
const auth = useAuth();
const check = checkPermission();
const getData = async () => {};
```

### Import Conventions

#### Package Internals (relative imports)
```typescript
import { User } from '../types/user';
import { constants } from './constants';
```

#### External Packages (absolute imports)
```typescript
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
```

#### Monorepo Workspace Imports
```typescript
import type { User } from '@xingu/shared';
import { Button } from '@xingu/ui';
```

#### Type-only Imports (optimization)
```typescript
import type { User } from '@xingu/shared';
import type { NextPage } from 'next';
```

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
  return <img src={src} />;
}

// 6. Helper Functions
function validateUserName(name: string): boolean {
  return name.length <= MAX_NAME_LENGTH;
}
```

### 🚨 NO Redundant Comments/JSDoc

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

## 🚨 CRITICAL RULES (Absolute)

1. **No coding without TODOs**
2. **No code without tests**
3. **No next task until build/test pass**
4. **No `any` type** (use `unknown`)
5. **No `console.log` in production code**
6. **No hardcoding** (use environment variables or constants)
7. **No files over 500 lines** (must split)
8. **No complex logic without meaningful comments** (avoid redundant comments)
9. **No missing async error handling**
10. **No ignoring accessibility (a11y)**
11. **No work completion without documentation update**
12. **No redundant comments that repeat obvious code**

---

## 📚 Error Handling Strategy

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
npm install
npm run dev              # All services
npm run dev --filter=web # Specific service
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

## 💡 Claude Assistant Behavior

### At Start of Work:
1. Create TODO list (3-10 items)
2. Break each TODO into smaller units
3. Set first TODO to 'in_progress'

### While Writing Code:
1. Follow TDD order (test → implementation → refactor)
2. Split modules according to MSA principles
3. Apply SOLID principles
4. Comply with TypeScript strict mode

### After Writing Code:
1. Run automated validation:
   ```bash
   npm run type-check
   npm run lint
   npm run test
   npm run build
   npm run test:e2e  # if needed
   ```
2. Fix immediately if failed
3. Check TODO completion
4. **Update this claude.md file**:
   - Add to "Recent Changes" section
   - Update "Current Status" section
   - Record new patterns discovered
5. Move to next TODO

### When Error Occurs:
1. Analyze error logs
2. Identify root cause
3. Fix and re-validate
4. Document the issue and solution

### Work Session Completion (MANDATORY):
**Before ending ANY work session:**
- ✅ All validation checks passed
- ✅ TODOs updated and completed ones checked off
- ✅ "Recent Changes" updated with session summary
- ✅ "Current Status" reflects project status
- ✅ New patterns or conventions documented
- ✅ Next steps clearly identified

**Documentation is NOT optional - it's part of completing work.**

---

## 📋 Recent Changes

### 2025-11-11: Microservice Architecture & Docker Integration
- **Status**: ✅ Complete
- **Changes**:
  1. Monorepo structure updated to MSA (3 services)
  2. Docker containerization (7 containers)
  3. Technology stack clarified
  4. MVP scope refined (Phase 1-3)
  5. Service responsibilities defined
  6. Added Docker development rules

- **Files Modified**:
  - `.cursorrules` - MSA structure, Docker rules
  - `docs/01-overview.md` - Technology stack, MVP scope

### 2025-11-10: Enhanced Documentation
- **Status**: ✅ Complete
- **Changes**:
  1. Translated .cursorrules to English
  2. Added post-work documentation protocol
  3. Added code style guidelines (no redundant comments)
  4. Added import conventions
  5. Added language policy

---

## 🔄 Current Status

### Project Stage
- **Architecture**: ✅ MSA defined
- **Infrastructure**: ✅ Docker planned (7 containers)
- **Documentation**: ✅ Complete (overview, IA)
- **Code**: ❌ Not started
- **Database**: ❌ Schema design pending
- **API**: ❌ Endpoint design pending

### What's Working
- ✅ Project documentation (overview, IA)
- ✅ MSA architecture defined (3 services)
- ✅ Docker strategy (7 containers)
- ✅ Technology stack selected
- ✅ MVP scope defined (Phase 1-3)
- ✅ Development rules and guidelines

### Next Steps
**Immediate:**
1. 🔴 Database schema design (PRD → DB schema)
2. 🔴 API endpoint design (RESTful + WebSocket)
3. 🔴 Detailed PRD document (03-prd.md)

**After Documentation:**
4. 🔴 Initialize Turborepo monorepo
5. 🔴 Create base services (auth, game, ws)
6. 🔴 Set up Docker Compose
7. 🔴 Implement MVP Phase 1 (OX Quiz game)

---

## 📚 Quick Reference

### Common Commands
```bash
# Development
npm run dev
npm run dev --filter=web

# Testing
npm run test
npm run test:e2e
npm run type-check

# Build
npm run build
npm run build --filter=auth-service

# Docker
docker-compose up
docker-compose down

# Git
git commit -m "feat: add user authentication"
```

### Git Commit Conventions
```
feat: New feature
fix: Bug fix
refactor: Refactoring
test: Add/modify tests
docs: Documentation changes
style: Code formatting
chore: Build/config changes
perf: Performance improvements
```

---

**Remember**: Quality over Speed. Writing it correctly is more important than writing it quickly.
