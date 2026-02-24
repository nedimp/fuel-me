# Architecture Overview

## 🏗️ Monorepo Structure

```
fuel-me-interview-prep/
├── apps/
│   ├── backend/              # NestJS API (Port 4000)
│   │   ├── src/
│   │   │   ├── main.ts       # Application entry point
│   │   │   ├── app.module.ts # Root module
│   │   │   ├── app.controller.ts
│   │   │   ├── app.service.ts
│   │   │   └── prisma.service.ts  # Database service
│   │   ├── prisma/
│   │   │   └── schema.prisma # Database schema
│   │   ├── .env              # Environment variables
│   │   └── package.json
│   │
│   ├── site-manager/         # Public Frontend (Port 3000)
│   │   ├── src/
│   │   │   ├── main.tsx      # React entry point
│   │   │   ├── App.tsx       # Main component
│   │   │   └── index.css     # Tailwind imports
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   └── package.json
│   │
│   └── dispatcher/           # Admin Frontend (Port 3001)
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   └── index.css
│       ├── index.html
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       └── package.json
│
├── packages/
│   └── shared/               # Shared TypeScript Types
│       ├── src/
│       │   └── index.ts      # Exported types
│       ├── dist/             # Compiled JS + .d.ts files
│       └── package.json
│
├── docker-compose.yml        # PostgreSQL setup
├── pnpm-workspace.yaml       # Workspace configuration
├── package.json              # Root package with scripts
└── README.md
```

## 🎯 Key Features

### Type Safety

The `shared` package ensures type safety across the entire stack:

```typescript
// packages/shared/src/index.ts
export interface HelloResponse {
  message: string;
  app: string;
  version: string;
}

// apps/backend/src/app.service.ts
getHello(): HelloResponse {
  return {
    message: 'Hello from Fuel.me Backend!',
    app: 'backend-api',
    version: '1.0.0',
  };
}

// apps/site-manager/src/App.tsx
const [helloData, setHelloData] = useState<HelloResponse | null>(null);
```

### Strict TypeScript Configuration

All packages use strict TypeScript:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

### ESLint Strict Mode

All packages enforce TypeScript ESLint rules:

```javascript
rules: {
  '@typescript-eslint/no-explicit-any': 'error',
}
```

## 🔌 API Endpoints

### Backend (http://localhost:4000)

- `GET /` - Root endpoint with timestamp
- `GET /health` - Health check with database status
- `GET /hello` - Hello world message for testing

## 🎨 Frontend Applications

### Site Manager (http://localhost:3000)

- **Purpose**: Public-facing application
- **Theme**: Blue/Indigo gradient
- **Features**:
  - Fetches data from backend
  - Displays API health status
  - Shows type-safe API responses

### Dispatcher (http://localhost:3001)

- **Purpose**: Admin/Internal dashboard
- **Theme**: Purple/Pink gradient
- **Features**:
  - System status monitoring
  - Infrastructure health checks
  - Admin-focused UI

## 🗄️ Database

### PostgreSQL via Docker

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: fuel_me_dev
```

### Prisma ORM

Schema example:

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

## 📦 Package Management

Using **pnpm** workspaces for efficient monorepo management:

- Shared dependencies are hoisted
- Workspace protocol for internal packages: `"shared": "workspace:*"`
- Fast installation and minimal disk usage

## 🔧 Development Workflow

### Adding a New Feature

1. **Define types in `shared` package:**

   ```typescript
   // packages/shared/src/index.ts
   export interface MyFeature {
     id: string;
     name: string;
   }
   ```

2. **Build shared package:**

   ```bash
   pnpm --filter shared build
   ```

3. **Implement backend logic:**

   ```typescript
   // apps/backend/src/app.controller.ts
   @Get('feature')
   getFeature(): MyFeature {
     return { id: '1', name: 'Feature' };
   }
   ```

4. **Use in both frontends:**

   ```typescript
   // apps/site-manager/src/App.tsx
   import type { MyFeature } from "shared";

   const [feature, setFeature] = useState<MyFeature | null>(null);
   ```

## 🚀 Deployment Strategy

### Backend

- Built with: `pnpm --filter backend build`
- Output: `apps/backend/dist/`
- Start production: `node apps/backend/dist/main.js`

### Frontends

- Built with: `pnpm --filter site-manager build`
- Output: `apps/site-manager/dist/`
- Serve static files with any web server

### Database Migrations

```bash
# Development
pnpm db:migrate

# Production
cd apps/backend
npx prisma migrate deploy
```

## 🎓 Best Practices

### Type Safety

- ✅ Always define types in `shared` package
- ✅ Use strict TypeScript mode
- ✅ No `any` types (enforced by ESLint)
- ✅ Validate data at API boundaries

### Code Organization

- ✅ Keep business logic in services
- ✅ Controllers handle HTTP concerns only
- ✅ Use DTOs for data validation
- ✅ Separate concerns between apps

### Development

- ✅ Run linting before commits
- ✅ Test API endpoints as you build
- ✅ Use both frontends to verify features
- ✅ Leverage AI tools for speed

### Git Workflow

```bash
# Good commit messages
git commit -m "feat: add user authentication endpoint"
git commit -m "fix: resolve type mismatch in HelloResponse"
git commit -m "refactor: extract validation logic to service"
```

## 🛠️ Extending the System

### Add New Backend Module

```bash
cd apps/backend
nest g module users
nest g controller users
nest g service users
```

### Add New Database Model

```prisma
// apps/backend/prisma/schema.prisma
model Product {
  id    String @id @default(uuid())
  name  String
  price Float
}
```

```bash
pnpm db:migrate
```

### Add New Shared Type

```typescript
// packages/shared/src/index.ts
export interface Product {
  id: string;
  name: string;
  price: number;
}
```

```bash
pnpm --filter shared build
```

## 📊 Performance

- **Vite**: Lightning-fast HMR for frontends
- **NestJS**: Efficient Node.js framework
- **pnpm**: Fast package installation
- **PostgreSQL**: High-performance database
- **Docker**: Isolated database environment

## 🔐 Security Considerations

- CORS configured for frontend origins only
- Environment variables for sensitive data
- Input validation with `class-validator`
- UUID primary keys for unpredictability
- Prepared statements via Prisma (SQL injection protection)

## 🎯 Interview Tips

1. **Speed matters**: Use AI to scaffold quickly
2. **Types first**: Define in `shared` before implementing
3. **Test early**: Verify in browser as you build
4. **Clean code**: ESLint catches issues automatically
5. **Demonstrate knowledge**: Explain architectural decisions

---

**Ready to showcase your skills!** 🚀
