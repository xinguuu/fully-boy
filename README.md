# 🎮 Xingu - Korean Party Game Platform

> **"Kahoot's convenience + Korean entertainment/meme game content"**

Xingu is a real-time party game platform inspired by Kahoot, designed for Korean entertainment culture. Create and play interactive games with friends in MT, workshops, and events.

---

## ✨ Key Features

- **🎯 Ready-to-Use Templates**: Choose from pre-built game templates and customize questions in 5 minutes
- **📱 Flexible Play Modes**: Mobile-required mode or MC mode (play without phones)
- **⚡ Real-time Multiplayer**: Live gameplay with WebSocket-powered synchronization
- **🎨 Korean Content**: Games inspired by Korean variety shows, SNS trends, and memes
- **🔒 Secure & Scalable**: JWT authentication, distributed sessions, microservice architecture

---

## 🏗️ Architecture

### Microservice Architecture (MSA)

**9 Containers:**
- **nginx** - Reverse proxy & load balancing
- **postgres** - Main database (PostgreSQL 17)
- **redis** - Session store & cache
- **web** - Next.js 16 frontend (SSR)
- **auth-service** - NestJS (authentication & user management)
- **template-service** - Express (public game templates)
- **game-service** - Express (game CRUD & favorites)
- **room-service** - Express (room management & PIN system)
- **ws-service** - Socket.io (real-time WebSocket)
- **result-service** - Express (game results & statistics)

### Monorepo Structure (Turborepo)

```
xingu/
├── apps/
│   ├── web/                    # Next.js 16 Frontend
│   ├── auth-service/           # NestJS Auth Service
│   ├── template-service/       # Express Template Service
│   ├── game-service/           # Express Game Service
│   ├── room-service/           # Express Room Service
│   ├── ws-service/             # Socket.io WebSocket
│   └── result-service/         # Express Result Service
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
- **pnpm**: 9+
- **Docker**: Docker Desktop or Docker Engine + Docker Compose

### Option 1: Docker (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/your-org/xingu.git
cd xingu

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 3. Start all containers (builds images on first run)
docker compose up --build

# Access the application:
# - Frontend: http://localhost (via Nginx)
# - All services accessible through Nginx reverse proxy

# Stop all containers
docker compose down

# View logs
docker compose logs -f web
docker compose logs -f auth-service
```

### Option 2: Local Development

```bash
# 1. Clone repository
git clone https://github.com/your-org/xingu.git
cd xingu

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your local database and Redis URLs

# 4. Start databases (Docker)
docker compose up -d postgres redis

# 5. Generate Prisma Client
pnpm --filter=@xingu/database db:generate

# 6. Run database migrations
pnpm --filter=@xingu/database db:migrate

# 7. Start all services (open 7 terminals or use tmux)
pnpm --filter=@xingu/auth-service dev
pnpm --filter=@xingu/template-service dev
pnpm --filter=@xingu/game-service dev
pnpm --filter=@xingu/room-service dev
pnpm --filter=@xingu/ws-service dev
pnpm --filter=@xingu/result-service dev
pnpm --filter=@xingu/web dev

# Access the application:
# - Frontend: http://localhost:3000
# - Auth Service: http://localhost:3001
# - Template Service: http://localhost:3002
# - Game Service: http://localhost:3003
# - Room Service: http://localhost:3004
# - WS Service: http://localhost:3005
# - Result Service: http://localhost:3006
```

---

## 💻 Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **State**: React Hooks
- **Real-time**: Socket.io Client

### Backend
- **Auth Service**: NestJS + JWT + Redis sessions
- **Template Service**: Express + Prisma + Redis cache
- **Game Service**: Express + Prisma
- **Room Service**: Express + Prisma + Redis
- **WS Service**: Socket.io + Redis Pub/Sub
- **Result Service**: Express + Prisma
- **Database**: PostgreSQL 17 + Prisma ORM
- **Session Store**: Redis

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Monorepo**: Turborepo + pnpm workspaces
- **Reverse Proxy**: Nginx

---

## 📦 Available Scripts

### Root Commands

```bash
# Development
pnpm dev                          # Start all services (local mode)
pnpm dev --filter=web             # Start specific service only

# Building
pnpm build                        # Build all packages
pnpm build --filter=web           # Build specific package

# Testing
pnpm test                         # Run all unit tests (138 tests)
pnpm --filter=@xingu/web test:e2e # Run browser E2E tests (18 tests)
pnpm type-check                   # Type check all packages
pnpm lint                         # Lint all packages

# Database
pnpm --filter=@xingu/database db:generate  # Generate Prisma Client
pnpm --filter=@xingu/database db:migrate   # Run migrations
pnpm --filter=@xingu/database db:studio    # Open Prisma Studio

# Docker
docker compose up -d              # Start all containers (detached)
docker compose down               # Stop all containers
docker compose logs -f [service]  # View logs
docker compose ps                 # List running containers
```

---

## 🐳 Docker Services

| Service | Port | Description | Dependencies |
|---------|------|-------------|--------------|
| nginx | 80, 443 | Reverse proxy & load balancer | All services |
| postgres | 5432 | Main database (PostgreSQL 17) | - |
| redis | 6379 | Session store & cache | - |
| web | 3000 | Next.js 16 frontend | All backend services |
| auth-service | 3001 | Authentication & user management | postgres, redis |
| template-service | 3002 | Public game templates | postgres, redis |
| game-service | 3003 | Game CRUD & favorites | postgres, redis |
| room-service | 3004 | Room management & PIN system | postgres, redis |
| ws-service | 3005 | Real-time WebSocket | redis |
| result-service | 3006 | Game results & statistics | postgres, redis |

---

## 🧪 Testing

All services include comprehensive test coverage:

```bash
# Backend unit tests (138 tests)
pnpm test

# Backend E2E tests (10 tests)
node test-websocket.js

# Browser E2E tests (18 tests with Playwright)
pnpm --filter=@xingu/web test:e2e

# Test coverage
pnpm test --coverage
```

**Test Coverage**:
- Auth Service: 17 unit tests
- Template Service: 18 unit tests
- Game Service: 26 unit tests
- Room Service: 28 unit tests
- WS Service: 28 unit tests
- Result Service: 21 unit tests
- **Total**: 138 unit tests + 10 E2E tests + 18 browser E2E tests

---

## 🔒 Security

- **Authentication**: JWT-based (15min access + 7d refresh tokens)
- **Password Hashing**: bcrypt (10 salt rounds)
- **Session Management**: Redis-based distributed sessions
- **Rate Limiting**: Redis-backed API rate limiting
- **Input Validation**: Zod schemas on all endpoints
- **SQL Injection Prevention**: Prisma ORM
- **XSS Prevention**: React auto-escaping + CSP headers
- **HTTPS Only**: Production deployment

---

## 📝 Environment Variables

See [.env.production.example](./.env.production.example) for production configuration.

Key variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/xingu

# Redis
REDIS_URL=redis://host:6379

# JWT
JWT_SECRET=your-secret-key-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Environment
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

---

## 📚 Documentation

Comprehensive documentation available in [docs/](./docs/) folder:

- **[00-INDEX.md](./docs/00-INDEX.md)** - Documentation guide map
- **[01-overview.md](./docs/01-overview.md)** - Project overview & vision
- **[02-ia.md](./docs/02-ia.md)** - Information Architecture & UI flows
- **[03-prd.md](./docs/03-prd.md)** - Product Requirements & API specs
- **[04-architecture.md](./docs/04-architecture.md)** - System architecture & diagrams
- **[05-design-guide.md](./docs/05-design-guide.md)** - Design system & styling
- **[06-development-guide.md](./docs/06-development-guide.md)** - Development guide & conventions

For AI assistant development guidelines, see [CLAUDE.md](./CLAUDE.md).

---

## 🎮 Game Flow

1. **Browse Templates**: Choose from public templates or create your own
2. **Customize Game**: Edit questions, answers, and settings
3. **Create Room**: Generate a 6-digit PIN code
4. **Join Game**: Participants enter PIN on their devices
5. **Play Live**: Real-time synchronized gameplay with leaderboard
6. **View Results**: Final rankings and statistics

---

## 🌐 Supported Game Types

- **OX Quiz** (True/False)
- **Four Choice Quiz** (Multiple choice)
- **Balance Game** (A vs B choices)
- **Initial Quiz** (Korean initial consonant quiz)
- **Speed Quiz** (Quick-fire questions)

---

## 👥 Contributing

This is a private project. For development guidelines:
- Follow conventions in [CLAUDE.md](./CLAUDE.md)
- Review [docs/06-development-guide.md](./docs/06-development-guide.md)
- Ensure all tests pass before committing

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
