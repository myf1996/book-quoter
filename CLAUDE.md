# Book Printing Quoter — Claude Project Context

## Project Overview
Full-stack web app for generating dynamic book printing quotes.
Tech: React 18 + TypeScript + Tailwind CSS (frontend) | Node.js + Express + TypeScript (backend) | PostgreSQL (database)

## Current Phase
**Phase 1 (Core Quoter)** — 6-step wizard, no pricing yet.
Phases 2–4 (pricing, auth, admin) come after Phase 1 is running locally.

## Key Documents
- `PROJECT-BRIEF.md` — naming conventions & tech decisions
- `MASTER-CLAUDE-CODE-PROMPT.md` — full Phase 1 spec
- `CONTRIBUTING.md` — developer workflow
- `ENVIRONMENT-SETUP.md` — env vars & database setup
- `DEPLOYMENT.md` — Vercel + Railway deployment (after local is green)
- `claude-dev-standards.skill.md` — code quality rules
- `claude-documentation.skill.md` — auto-doc generation

## Strict Naming Conventions
| Context | Convention | Example |
|---------|-----------|---------|
| Files | kebab-case + .type.ext | `trim-size.step.tsx`, `quoter.service.ts` |
| Variables/functions | camelCase | `quoteState`, `handleSelectTrimSize` |
| Classes/Interfaces | PascalCase | `QuoteService`, `QuoteConfig` |
| API endpoints | kebab-case | `GET /api/products/trim-sizes` |
| Database columns | snake_case | `min_pages`, `created_at` |
| JS from DB | camelCase | `minPages`, `createdAt` |

## Project Structure
```
OnPress/
├── frontend/          # React app  (port 3000)
├── backend/           # Express API (port 5000)
├── docs/
└── [root docs]
```

## Dev Workflow
- Run frontend: `cd frontend && npm start`
- Run backend: `cd backend && npm run dev`
- Lint: `npm run lint`
- Type check: `npm run type-check`
- Test: `npm run test`

## Code Quality Rules (non-negotiable)
- No `any` types in TypeScript
- JSDoc on all exported functions/components
- try-catch on all API calls
- No `console.log` in production code (`console.error`/`console.warn` OK)
- 70% test coverage minimum

## Deployment Strategy
- Local first → verify Phase 1 works → then deploy
- Frontend → Vercel | Backend + DB → Railway
- Cost: $0/month on free tiers
