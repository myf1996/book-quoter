# Project Brief - Book Printing Quoter
## Quick Reference Guide

---

## 📋 Project Overview

**Name:** Book Printing Quoter  
**Type:** Full-stack web application  
**Phase:** MVP (Phase 1-2, expandable to Phase 3-4)  
**Timeline:** 8 weeks  
**Cost:** $0/month (free tier deployment)  
**Status:** Ready for development

---

## 🎯 Business Goals

✅ Generate dynamic book printing quotes  
✅ Real-time price calculation  
✅ Admin controls for pricing & products  
✅ User account management  
✅ Scalable to enterprise (Phase 3-4)

---

## 💻 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Tailwind |
| Backend | Node.js + NestJS + TypeScript |
| ORM | TypeORM (type-safe database queries) |
| Database | PostgreSQL |
| State | Context API |
| UI | Tailwind CSS + React Hook Form |
| Testing | Jest + React Testing Library |
| Linting | ESLint + Prettier |
| Deploy | Vercel + Railway (includes PostgreSQL) |

---

## 📁 File Structure

**Frontend:**
```
src/pages/[name].page.tsx
src/components/[name].component.tsx
src/hooks/use-[name].hook.ts
src/context/[name].context.ts
src/utils/[name].utils.ts
```

**Backend:**
```
src/controllers/[name].controller.ts
src/services/[name].service.ts
src/routes/[name].routes.ts
src/middleware/[name].middleware.ts
src/models/[name].model.ts
src/types/[name].types.ts
src/config/[name].config.ts
```

---

## 🔤 NAMING CONVENTIONS (STRICT)

### Files: kebab-case + type
```
✅ price-calculator.service.ts
✅ quote.controller.ts
✅ trim-size.step.tsx
✅ use-auth.hook.ts

❌ PriceCalculator.ts, priceCalculator.js
```

### Code: camelCase
```
✅ const quoteState = {};
✅ function calculatePrice() {}

❌ const quote_state = {};
❌ function calculate_price() {}
```

### Classes/Interfaces: PascalCase
```
✅ class QuoteService {}
✅ interface QuoteData {}

❌ class quoteService {}
❌ interface quote_data {}
```

### Endpoints: kebab-case
```
✅ POST /api/price-calculator
✅ GET /api/products/trim-sizes
✅ PUT /api/admin/pricing/:pricingId

❌ POST /api/calculatePrice
❌ GET /api/products/trimSizes
```

---

## 📊 4-Phase Development

### Phase 1 (Weeks 1-2): Core Quoter
```
config.json:
  "phase1CoreQuoter": true
  "phase2PricingEngine": false
  "phase3Authentication": false
  "phase4AdminPanel": false

Deliverable: 6-step quoter without pricing
```

### Phase 2 (Weeks 3-4): Pricing Engine
```
config.json:
  "phase2PricingEngine": true  // ← Enable

Deliverable: Real-time price calculation
```

### Phase 3 (Weeks 5-6): Authentication
```
config.json:
  "phase3Authentication": true  // ← Enable

Deliverable: User login, save quotes
```

### Phase 4 (Weeks 7-8): Admin Panel
```
config.json:
  "phase4AdminPanel": true  // ← Enable

Deliverable: Admin controls for everything
```

---

## 🚀 Quick Start

```bash
# 1. Clone
git clone <repo>
cd book-quoter

# 2. Install
cd frontend && npm install
cd ../backend && npm install

# 3. Configure
# backend/.env
DATABASE_URL=postgresql://...
JWT_SECRET=secret_key

# 4. Setup DB
cd backend
npm run migrate
npm run seed

# 5. Run
# Terminal 1
cd frontend && npm start

# Terminal 2
cd backend && npm run dev

# 6. Deploy
# See DEPLOYMENT.md
```

---

## ✅ BEFORE COMMITTING CODE

```bash
# 1. Lint
npm run lint && npm run lint:fix

# 2. Type check
npm run type-check

# 3. Test
npm run test

# 4. Build
npm run build

# 5. Push to main → Auto-deploys to Vercel + Railway
```

---

## 📚 DOCUMENTATION

| Document | Purpose |
|----------|---------|
| `/docs/README.md` | Overview & navigation |
| `/docs/ARCHITECTURE.md` | System design |
| `/docs/API.md` | API reference |
| `/docs/DATABASE.md` | Schema documentation |
| `CONTRIBUTING.md` | Developer guide |
| `DEPLOYMENT.md` | Free deployment setup |
| `CODE_OF_CONDUCT.md` | Team standards |
| `config.json` | Feature flags |

**Auto-Documentation:** See `claude-documentation.skill.md`

---

## 🎓 CLAUDE SKILLS

### 1. Code Standards Enforcement
**File:** `claude-dev-standards.skill.md`

Auto-validates:
- File naming (kebab-case + type)
- Variable naming (camelCase)
- TypeScript types (no `any`)
- API endpoints (kebab-case)
- JSDoc comments
- Error handling
- Linting rules

**Trigger:** "review code", "lint", "build"

### 2. Documentation Generation
**File:** `claude-documentation.skill.md`

Auto-generates:
- Service documentation
- Controller documentation
- Component documentation
- API documentation
- Database documentation
- Architecture Decision Records

**Trigger:** Code change → Auto-updates docs

---

## 🌐 FREE DEPLOYMENT

| Component | Tool | Cost |
|-----------|------|------|
| Frontend | Vercel | FREE (100GB/mo bandwidth) |
| Backend | Railway | FREE (5GB storage) |
| Database | Railway PostgreSQL | FREE (5GB storage) |
| Domain | Custom | $12/year (optional) |
| **TOTAL** | | **$0/month** |

**Setup Time:** 30 minutes  
**Maintenance:** 5 minutes/month

**Details:** See `DEPLOYMENT.md`

---

## 🔧 CONFIGURATION

**File:** `config.json`

```json
{
  "phases": {
    "phase1CoreQuoter": true,
    "phase2PricingEngine": true,
    "phase3Authentication": false,
    "phase4AdminPanel": false
  },
  "features": {
    "quoter": { "enabled": true },
    "pricing": { "enabled": true },
    "auth": { "enabled": false },
    "adminPanel": { "enabled": false }
  }
}
```

Toggle features by changing boolean flags. Frontend automatically shows/hides UI.

---

## 📞 KEY DECISIONS

**Why Vercel + Railway + Supabase?**
- ✅ FREE tier sufficient for MVP
- ✅ Auto-scaling if needed
- ✅ Zero DevOps knowledge required
- ✅ Auto-HTTPS & CDN included
- ✅ Can migrate to paid tier easily

**Why TypeScript everywhere?**
- ✅ Type safety (fewer bugs)
- ✅ Better IDE support
- ✅ Self-documenting code
- ✅ Easier refactoring

**Why Context API not Redux?**
- ✅ MVP doesn't need Redux complexity
- ✅ Built-in to React
- ✅ Less boilerplate
- ✅ Can switch to Redux in Phase 3

**Why kebab-case endpoints?**
- ✅ Industry standard
- ✅ REST API best practices
- ✅ Looks professional
- ✅ Consistent with filenames

---

## 🎯 SUCCESS CRITERIA

### Phase 1 Complete
- ✅ Quoter renders 6 steps
- ✅ User can select all options
- ✅ Quote summary displays
- ✅ Responsive on mobile
- ✅ All tests pass

### Phase 2 Complete
- ✅ Pricing calculates correctly
- ✅ Shipping + tax applied
- ✅ Real-time updates on change
- ✅ 50+ price combinations tested

### Phase 3 Complete
- ✅ User registration works
- ✅ Quotes can be saved
- ✅ Quote history displays
- ✅ Email confirmations sent

### Phase 4 Complete
- ✅ Admin login works
- ✅ Can edit prices (no code)
- ✅ Can add products (no code)
- ✅ Dashboard shows analytics

---

## 🚨 COMMON MISTAKES

### ❌ DON'T:
- Use PascalCase in file names
- Use snake_case for variables
- Use `any` type in TypeScript
- Commit `.env` files
- Skip linting before push
- Skip tests
- Forget JSDoc comments
- Use camelCase in endpoints

### ✅ DO:
- Use kebab-case + type suffix
- Use camelCase for variables
- Specify explicit types
- Add `.env` to `.gitignore`
- Run `npm run lint:fix` before push
- Write tests for all features
- Document with JSDoc
- Use kebab-case for endpoints

---

## 📈 GROWTH PATH

**MVP (Weeks 1-8):**
- Basic quoter with pricing
- Free tier deployment

**Scale (Months 3-6):**
- Admin panel
- User accounts
- Analytics

**Enterprise (Months 6-12):**
- Advanced pricing rules
- Fulfillment integration
- Mobile app
- Multi-language support

---

## 🤝 TEAM ROLES

| Role | Responsibility |
|------|---|
| Frontend Dev | React components, UI/UX |
| Backend Dev | APIs, database, services |
| DevOps | Deployment, monitoring |
| QA | Testing, documentation |
| PM | Requirements, priorities |

---

## 📞 GETTING HELP

1. **Check documentation:** `/docs` folder
2. **Check CONTRIBUTING.md:** Developer guide
3. **Run linter:** `npm run lint` (shows issues)
4. **Run tests:** `npm run test` (test failures)
5. **Check logs:** `vercel logs` or `railway logs`
6. **Search docs:** Full-text search in `/docs`

---

## 🎉 READY TO START?

### Step 1: Setup Claude Code
```
Paste this entire document + all 4 skills into Claude Code
Ask: "Build Phase 1 based on this specification"
```

### Step 2: Create Repository
```bash
git init
git add .
git commit -m "feat: initial project setup"
git remote add origin <github-url>
git push -u origin main
```

### Step 3: Deploy
```
Follow DEPLOYMENT.md
- Connect Vercel
- Setup Railway
- Configure PostgreSQL
```

### Step 4: Start Coding
```bash
cd frontend && npm start
cd backend && npm run dev
```

---

**Project Status:** ✅ READY FOR DEVELOPMENT  
**Documentation:** ✅ COMPLETE  
**Naming Conventions:** ✅ DEFINED  
**Skills:** ✅ READY  
**Deployment:** ✅ FREE SETUP GUIDE  

**Next Step:** Assign developer and run Phase 1

---

**Questions?** Check the relevant document:
- Coding questions → `CONTRIBUTING.md`
- Deployment questions → `DEPLOYMENT.md`
- Architecture questions → `/docs/ARCHITECTURE.md`
- Code review checklist → `claude-dev-standards.skill.md`
- Documentation → `claude-documentation.skill.md`