# ⚙️ ENVIRONMENT SETUP GUIDE
## Complete Configuration for Development & Deployment

---

## 🎯 Quick Setup (10 minutes)

```bash
# 1. Copy environment templates
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# 2. Update values (see sections below)
# Edit frontend/.env.local and backend/.env

# 3. You're done! Run the app
cd frontend && npm run dev
cd backend && npm run dev
```

---

## 📋 Frontend Environment (.env.local)

> **Vue/Vite:** All frontend env vars must be prefixed with `VITE_` and are accessed via `import.meta.env.VITE_*`.

### Development Setup

**File:** `frontend/.env.local`

```env
# API Configuration
VITE_API_URL=http://localhost:5000
VITE_ENVIRONMENT=development

# Optional: Analytics
# VITE_SENTRY_DSN=
# VITE_MIXPANEL_TOKEN=
```

### Production Setup (Vercel)

**In Vercel Dashboard > Settings > Environment Variables**

```env
VITE_API_URL=https://api.quoter.railway.app
VITE_ENVIRONMENT=production
```

### Frontend .env.example Template

```env
# Development API URL
VITE_API_URL=http://localhost:5000

# Environment
VITE_ENVIRONMENT=development

# Optional: Analytics
# VITE_SENTRY_DSN=https://...@sentry.io/...
# VITE_MIXPANEL_TOKEN=abcdef123456
```

---

## 📋 Backend Environment (.env)

### Development Setup

**File:** `backend/.env`

```env
# Database Connection
DATABASE_URL=postgresql://postgres:password@localhost:5432/quoter_db

# JWT Secrets
JWT_SECRET=your_super_secret_key_here_min_32_characters_long_very_secure_key
ADMIN_JWT_SECRET=your_admin_secret_key_also_min_32_characters_long_secure_key

# Application
NODE_ENV=development
PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Optional: Logging
LOG_LEVEL=debug
```

### Production Setup (Railway)

**In Railway Dashboard > Project > Variables**

```env
# Database Connection (Railway auto-sets this)
DATABASE_URL=postgresql://user:password@host:5432/quoter_db

# JWT Secrets (MUST BE STRONG!)
JWT_SECRET=generate_random_32_char_string_here_use_openssl_rand_hex_16
ADMIN_JWT_SECRET=generate_another_random_32_char_string_use_openssl_rand_hex_16

# Application
NODE_ENV=production
PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL=https://quoter.vercel.app

# Logging
LOG_LEVEL=warn
```

### Backend .env.example Template

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/quoter_db

# Secrets
JWT_SECRET=generate_strong_random_key_here
ADMIN_JWT_SECRET=generate_strong_random_key_here

# Environment
NODE_ENV=development
PORT=5000

# CORS
FRONTEND_URL=http://localhost:5173

# Logging
LOG_LEVEL=debug

# Optional: Email
# SENDGRID_API_KEY=SG.xxx
# EMAIL_FROM=noreply@quoter.com
```

---

## 🗄️ DATABASE CONFIGURATION

### Local PostgreSQL Setup

**Option 1: Using Homebrew (macOS)**

```bash
# Install PostgreSQL
brew install postgresql

# Start PostgreSQL
brew services start postgresql

# Create database
createdb quoter_db

# Connect to database
psql quoter_db

# Create admin user
createuser -P quoter_user
# Enter password when prompted

# Grant privileges
psql quoter_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO quoter_user;"
```

**Option 2: Using Docker**

```bash
# Run PostgreSQL in Docker
docker run --name quoter-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=quoter_db \
  -p 5432:5432 \
  -d postgres:14

# Verify connection
psql postgresql://postgres:password@localhost:5432/quoter_db
```

**Option 3: Using Vercel Postgres / Supabase**

```bash
# Go to Supabase.com
# Create new project
# Copy connection string
# Add to backend/.env as DATABASE_URL
```

### Connection String Format

**Local:**
```
postgresql://username:password@localhost:5432/quoter_db
```

**Supabase/Railway:**
```
postgresql://user:password@host:5432/database?sslmode=require
```

---

## 🔐 GENERATING SECURE SECRETS

### Generate JWT Secrets

**Option 1: Using OpenSSL (Recommended)**

```bash
# Generate 32-character random string
openssl rand -hex 32

# Copy output and paste into .env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Option 2: Using Node.js**

```bash
# Run in terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy output
```

**Option 3: Online Generator (Less Secure)**

```
https://generate-random.org/
# Generate 64-character string
# Split in half for two secrets
```

### Add to .env

```env
# After generating
JWT_SECRET=<32-char-random-string-from-above>
ADMIN_JWT_SECRET=<another-32-char-random-string>
```

---

## ✅ VERIFICATION CHECKLIST

### Frontend Environment

```bash
# Verify .env.local exists
ls frontend/.env.local

# Check API URL is set
grep VITE_API_URL frontend/.env.local

# Should output: VITE_API_URL=http://localhost:5000
```

### Backend Environment

```bash
# Verify .env exists
ls backend/.env

# Check database URL
grep DATABASE_URL backend/.env

# Check secrets are set
grep JWT_SECRET backend/.env
grep ADMIN_JWT_SECRET backend/.env

# All should have values set
```

### Database Connection

```bash
# Test PostgreSQL connection
psql $DATABASE_URL -c "SELECT 1;"

# Should output: "1" or similar success message
```

### API Connection

```bash
# Start backend
cd backend && npm run dev

# In another terminal, test API
curl http://localhost:5000/api/config

# Should return JSON response
```

---

## 🚀 DEPLOYMENT ENVIRONMENT SETUP

### Step 1: Setup Vercel (Frontend)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd frontend
vercel --prod

# Add environment variables in Vercel dashboard
VITE_API_URL=https://api.quoter.railway.app
VITE_ENVIRONMENT=production
```

### Step 2: Setup Railway (Backend + Database)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd backend
railway up

# Add environment variables in Railway dashboard
DATABASE_URL=<auto-generated>
JWT_SECRET=<generate-new-strong-secret>
ADMIN_JWT_SECRET=<generate-new-strong-secret>
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://quoter.vercel.app
LOG_LEVEL=warn
```

### Step 3: Setup Database on Railway

Railway includes PostgreSQL for free:
- Select PostgreSQL service
- Railway creates `DATABASE_URL` automatically
- Auto-connections to backend

### Step 4: Run Migrations

```bash
# Using Railway CLI
railway run npm run migrate

# Verify migrations ran
railway run npm run test:db
```

---

## 🔄 ENVIRONMENT VARIABLE REFERENCE

### Frontend Variables

> Accessed in Vue code as `import.meta.env.VITE_API_URL` etc.

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| `VITE_API_URL` | Yes | `http://localhost:5000` | Backend API URL |
| `VITE_ENVIRONMENT` | No | `development` | For feature flags |
| `VITE_SENTRY_DSN` | No | `https://...@sentry.io/...` | Error tracking |

### Backend Variables

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| `DATABASE_URL` | Yes | `postgresql://...` | Database connection |
| `JWT_SECRET` | Yes | `abc123...` | JWT signing key |
| `ADMIN_JWT_SECRET` | Yes | `def456...` | Admin JWT key |
| `NODE_ENV` | Yes | `development` | Environment |
| `PORT` | No | `5000` | Server port |
| `FRONTEND_URL` | No | `http://localhost:5173` | For CORS |
| `LOG_LEVEL` | No | `debug` | Logging level |

---

## 🆘 TROUBLESHOOTING

### Error: "Cannot connect to database"

```bash
# 1. Check DATABASE_URL format
echo $DATABASE_URL

# 2. Test connection directly
psql $DATABASE_URL -c "SELECT 1;"

# 3. Verify PostgreSQL is running
# macOS: brew services list
# Linux: systemctl status postgresql
# Docker: docker ps | grep postgres

# 4. Check if database exists
psql postgres -l | grep quoter_db
```

### Error: "CORS error"

```bash
# 1. Check FRONTEND_URL in backend/.env
FRONTEND_URL=http://localhost:5173  # or your deployed URL

# 2. Verify backend CORS config
# In backend/app.ts, check cors() includes FRONTEND_URL

# 3. Restart backend
npm run dev
```

### Error: ".env file not found"

```bash
# 1. Copy from example
cp backend/.env.example backend/.env

# 2. Fill in values
vi backend/.env

# 3. Verify file exists
ls -la backend/.env
```

### Error: "Invalid JWT secret"

```bash
# 1. Generate new secret
openssl rand -hex 32

# 2. Update .env
JWT_SECRET=<new-secret>

# 3. Restart backend
npm run dev
```

---

## 🔒 SECURITY BEST PRACTICES

### DO ✅
```
✅ Generate strong random secrets (min 32 characters)
✅ Store secrets in .env files (never in code)
✅ Add .env to .gitignore
✅ Use different secrets for dev/prod
✅ Rotate secrets every 90 days
✅ Use HTTPS in production
✅ Enable CORS only for your frontend
✅ Keep dependencies updated
```

### DON'T ❌
```
❌ Use hardcoded secrets
❌ Commit .env files to git
❌ Use simple passwords
❌ Share secrets in Slack/email
❌ Use same secret for dev & prod
❌ Enable CORS for all origins (*)
❌ Store passwords in comments
❌ Use default database passwords
```

---

## 📝 .gitignore Template

**File:** `.gitignore` (repo root)

```
# Environment variables
.env
.env.local
.env.*.local
*.env

# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build output
dist/
build/
.next/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Testing
coverage/
.nyc_output/

# Logs
logs/
*.log

# Temporary
tmp/
temp/
.cache/
```

---

## ✨ QUICK REFERENCE

### Start Development (3 commands)

```bash
# Terminal 1: Frontend
cd frontend && npm run dev

# Terminal 2: Backend
cd backend && npm run dev

# Terminal 3: View logs (optional)
# Monitor http://localhost:5173 and http://localhost:5000
```

### Deploy to Production (2 commands)

```bash
# Deploy frontend to Vercel
cd frontend && vercel --prod

# Deploy backend to Railway
cd backend && railway up
```

### Environment Files to Update

```
frontend/.env.local  - Set VITE_API_URL (accessed via import.meta.env.VITE_API_URL)
backend/.env         - Set DATABASE_URL, JWT secrets
```

---

## 📚 RELATED DOCUMENTATION

- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development guidelines
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions
- [PROJECT-BRIEF.md](./PROJECT-BRIEF.md) - Project overview
- [README.md](./README.md) - Main readme

---

## ✅ SETUP COMPLETE

When all environment variables are configured:

✅ Frontend can connect to backend  
✅ Backend can connect to database  
✅ Database has all tables  
✅ API endpoints are accessible  
✅ Ready for development  

**Next:** Run `npm run dev` in frontend and `npm run dev` in backend!

---

**Last Updated:** July 2026  
**Status:** Ready for use

