# Fuel.me Interview Prep - Monorepo

**Blank Slate Environment** for Senior Full Stack Engineer Technical Interview

## 📋 Important Documents

- **[CHECKLIST.md](CHECKLIST.md)** - Step-by-step pre-interview setup verification
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design patterns
- **[AI_PROMPTS.md](AI_PROMPTS.md)** - AI prompts guide for rapid development

## 🏗️ Structure

```
├── apps/
│   ├── backend/          # NestJS API (Port 4000)
│   ├── site-manager/     # Public-facing React app (Port 3000)
│   └── dispatcher/       # Admin dashboard React app (Port 3001)
└── packages/
    └── shared/           # Shared TypeScript types
```

## ⚡ Quick Start

### Prerequisites

- Node.js 20+ (see `.nvmrc`)
- Docker Desktop (for PostgreSQL)
- pnpm 8+

### Installation

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm

# Install all dependencies
pnpm install

# Build shared types package
pnpm --filter shared build

# Generate Prisma client
pnpm --filter backend db:generate
```

### Database Setup

```bash
# Start PostgreSQL in Docker
docker-compose up -d

# Wait a few seconds, then run migrations
pnpm db:migrate
```

### Start Development

```bash
# Start all applications (backend + both frontends)
pnpm dev
```

**Open in browser:**

- Backend API: http://localhost:4000/health
- Site Manager: http://localhost:3000
- Dispatcher: http://localhost:3001

## ✅ Verification

**All checks must pass before interview:**

```bash
# 1. Verify linting (should pass with zero errors)
pnpm lint

# 2. Verify backend health
curl http://localhost:4000/health

# 3. Verify both frontends load and fetch data
# Open http://localhost:3000 and http://localhost:3001
```

## 📦 Available Scripts

| Command           | Description                             |
| ----------------- | --------------------------------------- |
| `pnpm dev`        | Start all apps in development mode      |
| `pnpm build`      | Build all apps for production           |
| `pnpm lint`       | Run ESLint on all packages (must pass!) |
| `pnpm db:migrate` | Run database migrations                 |
| `pnpm db:studio`  | Open Prisma Studio (database GUI)       |

## 🛠️ Tech Stack

| Layer               | Technology                              |
| ------------------- | --------------------------------------- |
| **Frontend**        | React + Vite + TypeScript + TailwindCSS |
| **Backend**         | NestJS + TypeScript                     |
| **Database**        | PostgreSQL + Prisma ORM                 |
| **Package Manager** | pnpm (workspace)                        |
| **Type Safety**     | Shared TypeScript types package         |
| **Linting**         | ESLint (strict mode)                    |

## 🎯 What You Have

✅ **Two Frontend Applications:**

- Site Manager (Public-facing) - Port 3000
- Dispatcher (Admin Dashboard) - Port 3001

✅ **One Backend Application:**

- NestJS API with health checks - Port 4000

✅ **Type-Safe Architecture:**

- Shared TypeScript types between all apps
- Strict TypeScript mode enabled
- ESLint configured with zero tolerance

✅ **Database Ready:**

- PostgreSQL running in Docker
- Prisma ORM configured
- Migrations ready to run

✅ **Professional Setup:**

- Monorepo with pnpm workspaces
- Hot-reload in development
- Production-ready build scripts
- CORS configured for frontends

## 🚀 During the Interview

1. **Start with types**: Define in `packages/shared/src/index.ts`
2. **Backend first**: Implement in `apps/backend/src/`
3. **Frontend next**: Use shared types in both apps
4. **Use AI aggressively**: See [AI_PROMPTS.md](AI_PROMPTS.md) for examples
5. **Test as you go**: Verify in both frontends

## 📚 Documentation

- **CHECKLIST.md** - Complete pre-interview verification checklist
- **ARCHITECTURE.md** - Detailed architecture documentation
- **AI_PROMPTS.md** - AI assistance strategies and prompts

## 🆘 Troubleshooting

### Port conflicts

```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```

### Database issues

```bash
docker-compose down
docker-compose up -d
pnpm db:migrate
```

### Module not found

```bash
pnpm --filter shared build
pnpm --filter backend db:generate
```

## ✨ You're Ready!

If `pnpm dev` starts all three apps and they can communicate with each other, you're ready for the interview. Good luck! 🍀
