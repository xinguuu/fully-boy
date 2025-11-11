# 🎮 Xingu - Korean Party Game Platform

> **"Kahoot's convenience + Korean entertainment/meme game content"**

Xingu is a Korean-style party game platform that provides ready-to-use game frameworks for MT, workshops, and events.

---

## 📚 Documentation

- [01-overview.md](./docs/01-overview.md) - Project Overview
- [02-ia.md](./docs/02-ia.md) - Information Architecture
- [03-prd.md](./docs/03-prd.md) - Product Requirements Document
- [04-architecture.md](./docs/04-architecture.md) - System Architecture
- [05-design-guide.md](./docs/05-design-guide.md) - Design System Guide

---

## 🏗️ Architecture

### Microservice Architecture (MSA) + Turborepo

**7 Services:**
1. **nginx** - Reverse proxy, load balancing
2. **postgres** - Main database (users, games, rooms)
3. **redis** - Session sharing, real-time state
4. **web** - Next.js 15 frontend (SSR)
5. **auth-service** - NestJS (authentication, users)
6. **game-service** - Express (games, rooms, templates)
7. **ws-service** - Socket.io (real-time WebSocket)

### Monorepo Structure

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
│   └── nginx/                  # Reverse Proxy Config
└── docs/                       # Project documentation
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 24+
- **npm**: 10+
- **Docker**: Docker Desktop or Docker Engine + Docker Compose
- **PostgreSQL**: 17+ (or use Docker)
- **Redis**: Latest (or use Docker)

### Option 1: Local Development (Without Docker)

```bash
# 1. Clone repository
git clone https://github.com/your-org/xingu.git
cd xingu

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your local database and Redis URLs

# 4. Generate Prisma Client
npm run db:generate

# 5. Run database migrations
npm run db:migrate

# 6. Seed database with sample data
npm run db:seed

# 7. Start all services in development mode
npm run dev

# Access the application:
# - Frontend: http://localhost:3000
# - Auth Service: http://localhost:3001
# - Game Service: http://localhost:3002
# - WS Service: http://localhost:3003
```

### Option 2: Docker Development

```bash
# 1. Clone repository
git clone https://github.com/your-org/xingu.git
cd xingu

# 2. Set up environment variables
cp .env.example .env

# 3. Start all containers (first time will build images)
docker-compose up --build

# Access the application:
# - Frontend: http://localhost (via Nginx)
# - All services are accessible through Nginx reverse proxy

# Stop all containers
docker-compose down

# View logs
docker-compose logs -f web
docker-compose logs -f auth-service
```

---

## 📦 Available Scripts

### Root Commands

```bash
# Development
npm run dev                     # Start all services in dev mode
npm run dev --filter=web        # Start specific service only

# Building
npm run build                   # Build all packages
npm run build --filter=web      # Build specific package

# Testing
npm run test                    # Run all unit tests
npm run test:e2e                # Run E2E tests
npm run type-check              # Type check all packages
npm run lint                    # Lint all packages

# Database
npm run db:generate             # Generate Prisma Client
npm run db:migrate              # Run migrations
npm run db:seed                 # Seed database
npm run db:studio               # Open Prisma Studio

# Formatting
npm run format                  # Format all files
npm run format:check            # Check formatting

# Cleanup
npm run clean                   # Clean all build artifacts
```

---

## 💻 Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI + Radix UI
- **State**: Zustand, TanStack Query
- **Form**: react-hook-form + Zod

### Backend
- **Auth Service**: NestJS + JWT + Redis sessions
- **Game Service**: Express + Zod validation
- **WS Service**: Socket.io + Redis Pub/Sub
- **Database**: PostgreSQL 17 + Prisma ORM
- **Session Store**: Redis

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Monorepo**: Turborepo + npm workspaces
- **Reverse Proxy**: Nginx

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test --coverage
```

---

## 🔒 Security

- JWT-based authentication (15min access + 7d refresh tokens)
- bcrypt password hashing (10 salt rounds)
- Rate limiting (Redis-based)
- Input validation (Zod schemas)
- SQL injection prevention (Prisma ORM)
- XSS prevention (React auto-escaping + CSP)
- HTTPS only (production)

---

## 📝 Environment Variables

See [.env.example](./.env.example) for all available environment variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret key for JWT signing
- `NODE_ENV` - Environment (development/production)

---

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| nginx | 80, 443 | Reverse proxy & load balancer |
| postgres | 5432 | Main database |
| redis | 6379 | Session store & cache |
| web | 3000 | Next.js frontend |
| auth-service | 3001 | Authentication service |
| game-service | 3002 | Game management service |
| ws-service | 3003 | Real-time WebSocket service |

---

## 📊 Project Status

**Current Phase**: Infrastructure Setup ✅

### Completed
- ✅ Turborepo monorepo structure
- ✅ Shared packages (@xingu/shared, @xingu/database, @xingu/config)
- ✅ All 4 apps skeleton (web, auth-service, game-service, ws-service)
- ✅ Docker Compose configuration (7 containers)
- ✅ Prisma schema with 7 tables
- ✅ Zod validation schemas
- ✅ TypeScript + ESLint + Prettier setup

### Next Steps (Week 1: Backend)
- [ ] Implement Auth Service endpoints (signup, login, logout, refresh, me)
- [ ] Implement Game Service endpoints (templates, my-games, rooms)
- [ ] Implement WebSocket Service events (join-room, start-game, submit-answer, etc.)
- [ ] Unit tests for all services
- [ ] Integration tests

### Future (Week 2: Frontend)
- [ ] Next.js pages (home, browse, my-games, edit, play, results)
- [ ] UI components (Shadcn UI)
- [ ] State management (Zustand stores)
- [ ] Real-time game flow (Socket.io client)
- [ ] E2E tests (Playwright)

---

## 👥 Contributing

This is a private project. Please follow the coding conventions in [CLAUDE.md](./CLAUDE.md).

---

## 📄 License

Private & Confidential

---

## 🆘 Support

For questions or issues:
- Check [docs/](./docs/) folder
- Review [CLAUDE.md](./CLAUDE.md) for development guidelines
- Contact the development team

---

**Built with ❤️ for Korean party culture**
