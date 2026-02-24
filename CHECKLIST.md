# Pre-Interview Checklist

## ✅ Setup Verification

Run through this checklist **before** your interview call.

### 1. Docker & PostgreSQL

**Start Docker Desktop:**

- Open Docker Desktop application on your Mac
- Wait for it to fully start (whale icon should be stable in menu bar)

**Start PostgreSQL:**

```bash
docker-compose up -d
```

**Verify it's running:**

```bash
docker ps
```

You should see `fuel-me-postgres` container running.

### 2. Database Setup

**Run migrations:**

```bash
pnpm db:migrate
```

This will create the initial database schema.

### 3. Dependencies Check

**Ensure all dependencies are installed:**

```bash
pnpm install
```

**Build shared types:**

```bash
pnpm --filter shared build
```

### 4. Linting Verification

**Run linting (should pass with zero errors):**

```bash
pnpm lint
```

✅ **Expected result:** All packages lint successfully with no errors.

### 5. Start All Applications

**Start everything in development mode:**

```bash
pnpm dev
```

This will start:

- Backend API: http://localhost:4000
- Site Manager: http://localhost:3000
- Dispatcher: http://localhost:3001

### 6. Verify in Browser

Open three browser tabs:

1. **Backend API** (http://localhost:4000/health)
   - Should show: `{"status":"healthy","database":"connected",...}`

2. **Site Manager** (http://localhost:3000)
   - Should display: "Site Manager" page with "Backend Connected" message
   - Data should be fetched from API and displayed

3. **Dispatcher** (http://localhost:3001)
   - Should display: "Dispatcher" admin dashboard with "System Status"
   - Data should be fetched from API and displayed

### 7. TypeScript Type Safety Verification

**Check that types are shared:**

- Both frontend apps import types from the `shared` package
- No TypeScript errors in your IDE
- IntelliSense/autocomplete works for API response types

### 8. Final Checklist

- [ ] Docker Desktop is running
- [ ] PostgreSQL container is up (`docker ps`)
- [ ] Backend API responds at http://localhost:4000/health
- [ ] Site Manager loads at http://localhost:3000
- [ ] Dispatcher loads at http://localhost:3001
- [ ] Both frontends fetch and display data from backend
- [ ] `pnpm lint` passes with zero errors
- [ ] No red errors in your IDE
- [ ] TypeScript strict mode is enabled
- [ ] Shared types work across apps

## 🚀 You're Interview Ready!

If all items above are ✅, you're ready for the interview.

## 🔧 Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Find and kill processes on ports 3000, 3001, or 4000
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```

### Database Connection Issues

```bash
# Stop and restart PostgreSQL
docker-compose down
docker-compose up -d

# Wait a few seconds, then run migrations
pnpm db:migrate
```

### Module Not Found Errors

```bash
# Clean install
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
pnpm install
pnpm --filter shared build
pnpm --filter backend db:generate
```

### TypeScript Errors

```bash
# Rebuild everything
pnpm build
```

## 📚 During the Interview

When given a User Story:

1. **Use your AI tools aggressively** - That's what they want to see!
2. **Start with the backend** - Define types in `shared` package first
3. **Implement backend logic** - Add controllers/services in `apps/backend`
4. **Build frontend features** - Use shared types in both apps
5. **Test as you go** - Use both apps to verify functionality

## 🎯 Quick Commands Reference

```bash
# Start everything
pnpm dev

# Lint all code
pnpm lint

# Database migrations
pnpm db:migrate

# Open Prisma Studio (GUI for database)
pnpm db:studio

# Build all apps
pnpm build

# Install new package to backend
pnpm --filter backend add [package-name]

# Install new package to site-manager
pnpm --filter site-manager add [package-name]

# Install new package to dispatcher
pnpm --filter dispatcher add [package-name]

# Add shared type
# Edit: packages/shared/src/index.ts
# Then: pnpm --filter shared build
```

Good luck! 🍀
