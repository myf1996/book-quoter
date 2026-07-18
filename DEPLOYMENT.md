# Deployment Guide - FREE Tools Only
## Book Printing Quoter Full Stack Deployment

**Tools Used:** Vercel (Frontend) + Railway (Backend) + Supabase (Database)  
**Cost:** $0/month (free tier)  
**Estimated Setup Time:** 30 minutes

---

## 📋 Prerequisites

- GitHub account
- Code pushed to GitHub repository
- Environment variables defined

---

## 🌐 FRONTEND DEPLOYMENT (Vercel - FREE)

### Step 1: Connect Repository to Vercel

```bash
# Option A: Via Vercel CLI
npm i -g vercel
cd frontend
vercel login
vercel
```

**Or Option B: Via Web Interface**
1. Go to https://vercel.com
2. Click "New Project"
3. Select GitHub repository
4. Choose "frontend" folder
5. Click "Deploy"

### Step 2: Configure Environment Variables

**In Vercel Dashboard:**
1. Go to Project Settings > Environment Variables
2. Add:
```
REACT_APP_API_URL=https://api.quoter.railway.app
REACT_APP_ENVIRONMENT=production
```

### Step 3: Deploy

```bash
vercel --prod
```

**Or automatic via GitHub:**
- Push to main branch
- Vercel auto-deploys

### Result
```
✅ Frontend deployed
   URL: https://quoter.vercel.app
   Auto-deploy on push: Enabled
   SSL: Automatic
```

---

## 🔧 BACKEND DEPLOYMENT (Railway - FREE)

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Click "Start Project"
3. Sign in with GitHub
4. Click "Deploy from GitHub repo"

### Step 2: Configure Project

**Railway Dashboard:**
1. Select your repository
2. Select "Node.js" environment
3. Railway auto-detects `backend/` folder

### Step 3: Set Environment Variables

**In Railway Dashboard > Variables:**

```
DATABASE_URL=postgresql://{user}:{pass}@{host}/{db}
JWT_SECRET=your_super_secret_key_here_min_32_chars
ADMIN_JWT_SECRET=your_admin_secret_key_min_32_chars
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://quoter.vercel.app
```

### Step 4: Add Database

**In Railway Dashboard:**
1. Click "+" to add service
2. Select "PostgreSQL"
3. Railway auto-connects to `DATABASE_URL`

### Step 5: Deploy

```bash
git push origin main
```

**Or via Railway Dashboard:**
- Click "Deploy" button

### Result
```
✅ Backend deployed
   URL: https://api.quoter.railway.app
   Auto-deploy on push: Enabled
   Database: Connected (PostgreSQL)
```

---

## 🗄️ DATABASE DEPLOYMENT (Supabase - FREE)

### Option A: Railway's PostgreSQL (Recommended)
Railway includes PostgreSQL. No additional setup needed.

### Option B: Supabase (Alternative)

```
1. Go to https://supabase.com
2. Click "New project"
3. Select region (closest to you)
4. Create project
5. Get connection string
6. Add to Railway environment variables
```

**Supabase Free Tier:**
- 500 MB database
- 2 GB bandwidth
- Email support

---

## 🗄️ DATABASE MIGRATIONS

### Run Migrations on Deployed Database

```bash
# Install dotenv-cli
npm install -D dotenv-cli

# Set production DATABASE_URL
export DATABASE_URL="postgresql://user:pass@host:5432/db"

# Run migrations
npm run migrate

# Seed data
npm run seed
```

**Or via Railway CLI:**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Run commands
railway run npm run migrate
railway run npm run seed
```

---

## 📊 MONITORING & LOGS

### View Logs

**Vercel:**
```
Dashboard > Project > Deployments > Select deployment > Logs
```

**Railway:**
```
Dashboard > Select project > Logs tab
```

### Monitor Performance

**Vercel Analytics:**
```
Dashboard > Analytics > View metrics
- Page load time
- First Contentful Paint (FCP)
- Cumulative Layout Shift (CLS)
```

**Railway Metrics:**
```
Dashboard > Metrics tab
- CPU usage
- Memory usage
- Network I/O
- Response time
```

---

## 🔐 SECURITY SETUP

### Add Domain (Optional)

**Vercel:**
1. Dashboard > Settings > Domains
2. Add custom domain
3. Update DNS records

**Railway:**
1. Dashboard > Settings > Custom Domain
2. Add domain
3. Update DNS records

### Enable HTTPS
✅ Automatic on both Vercel and Railway

### Environment Variable Best Practices

```bash
# ❌ NEVER commit secrets
# ❌ Database URL in code
# ❌ JWT keys in code

# ✅ ALWAYS use environment variables
# ✅ Add .env to .gitignore
# ✅ Use dashboard for secrets
```

### .gitignore Example
```
.env
.env.local
.env.production
node_modules/
dist/
build/
.DS_Store
```

---

## 🔄 CI/CD PIPELINE (Automatic)

### GitHub Actions Setup

**File: `.github/workflows/deploy.yml`**

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: |
          cd frontend && npm ci
          cd ../backend && npm ci
      
      - name: Lint
        run: |
          cd frontend && npm run lint
          cd ../backend && npm run lint
      
      - name: Type check
        run: |
          cd frontend && npm run type-check
          cd ../backend && npm run type-check
      
      - name: Tests
        run: |
          cd frontend && npm run test
          cd ../backend && npm run test
      
      - name: Build
        run: |
          cd frontend && npm run build
          cd ../backend && npm run build
      
      - name: Deploy to Vercel
        if: github.ref == 'refs/heads/main'
        run: vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

### Setup GitHub Secrets

1. Go to Repository Settings > Secrets
2. Add:
   ```
   VERCEL_TOKEN=your_vercel_token
   RAILWAY_TOKEN=your_railway_token
   ```

---

## 📈 SCALING (When Free Tier Isn't Enough)

### Vercel Paid Tier
- **Pro:** $20/month
- Analytics & speed insights
- Increased serverless functions
- Priority support

### Railway Paid Tier
- **Pay as you go:** ~$5-50/month
- Based on actual usage
- More generous free tier than most

### Supabase Paid Tier
- **Pro:** $25/month
- 8 GB database
- 50 GB bandwidth
- Email support

---

## 🆘 TROUBLESHOOTING

### Frontend Not Connecting to Backend

**Check:**
```bash
# 1. Verify backend URL in Vercel env vars
REACT_APP_API_URL=https://api.quoter.railway.app

# 2. Check CORS in backend
# In backend/app.ts
app.use(cors({
  origin: 'https://quoter.vercel.app',
  credentials: true
}));

# 3. Test endpoint
curl https://api.quoter.railway.app/api/config
```

### Database Connection Error

**Check:**
```bash
# 1. Verify DATABASE_URL in Railway
# Should look like:
postgresql://user:pass@host:5432/database

# 2. Test connection
psql $DATABASE_URL

# 3. Check migrations ran
SELECT * FROM migrations;
```

### Slow Performance

**Solutions:**
```
1. Check Vercel Analytics
2. Check Railway Metrics
3. Enable caching headers in Express
4. Add database indexes
5. Optimize API responses
6. Enable Vercel CDN
```

### 500 Errors

**Check logs:**
```bash
# Vercel logs
vercel logs my-project

# Railway logs
railway run npm run dev --log-level debug
```

---

## 📱 MOBILE APP (iOS/Android)

### Using React Native or PWA

**Option A: PWA (Recommended for MVP)**
```bash
# Already works on mobile
# Just access https://quoter.vercel.app on phone
# Add to home screen
```

**Option B: React Native**
- Same codebase as web
- Deploy to App Store / Play Store
- Use EAS Build (free tier available)

---

## 💰 COST SUMMARY (Monthly)

| Service | Free Tier | Cost |
|---------|-----------|------|
| Vercel (Frontend) | 100GB bandwidth | $0 |
| Railway (Backend + DB) | 5GB storage | $0 |
| Supabase (if used) | 500MB storage | $0 |
| Domain (optional) | - | $12/year |
| **TOTAL** | | **$0/month** |

---

## 🚀 DEPLOYMENT CHECKLIST

### Before First Deploy
- [ ] GitHub repository created
- [ ] .env.example file created
- [ ] All secrets in .gitignore
- [ ] Tests passing locally
- [ ] Linting passing
- [ ] TypeScript compiling

### Vercel Setup
- [ ] Project created
- [ ] Repository connected
- [ ] Environment variables added
- [ ] Build command configured
- [ ] Deploy on main push enabled

### Railway Setup
- [ ] Project created
- [ ] GitHub connected
- [ ] PostgreSQL service added
- [ ] Environment variables added
- [ ] Migrations run successfully

### Post-Deploy
- [ ] Frontend loads (https://quoter.vercel.app)
- [ ] Backend responds (https://api.quoter.railway.app/api/config)
- [ ] Database connected
- [ ] API tests passing
- [ ] Monitoring enabled

---

## 📞 FREE SUPPORT

| Platform | Support | Response Time |
|----------|---------|---|
| Vercel | Community forum + Email | 24-48h |
| Railway | Community Discord | 1-4h |
| Supabase | Community Discord + GitHub | 2-6h |

**Get Help:**
- Vercel: https://vercel.com/support
- Railway: https://railway.app/support
- Supabase: https://supabase.com/support

---

## 🎯 NEXT STEPS (After Initial Deploy)

1. **Test everything**
   ```bash
   # Visit https://quoter.vercel.app
   # Try all features
   # Check network errors
   ```

2. **Setup monitoring**
   - Vercel Analytics
   - Railway Metrics
   - Error tracking (Sentry - free tier)

3. **Setup CI/CD**
   - GitHub Actions (free)
   - Auto-deploy on push

4. **Setup backups**
   - Database backups (Railway auto)
   - Code backups (GitHub)

5. **Plan scaling**
   - Monitor usage
   - Upgrade when needed
   - Estimate monthly cost

---

**Deployment Complete!** 🎉

Frontend: https://quoter.vercel.app  
Backend: https://api.quoter.railway.app  
Database: PostgreSQL on Railway

Cost: $0/month (free tier)  
Maintenance: ~5 minutes/month

