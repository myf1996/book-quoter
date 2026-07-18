# Book Printing Quoter — Claude Project Context

## Project Overview
Full-stack web app for generating dynamic book printing quotes.
**GitHub:** https://github.com/myf1996/book-quoter

## Tech Stack

### Frontend (port 5173 — Vite)
- Vue 3 (Composition API + `<script setup>`) + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- VeeValidate (forms)
- Pinia (state — replaces Context API)
- Vue Router 4 (routing)
- Axios (HTTP)
- Vitest + Vue Test Utils (testing)

### Backend (port 3001)
- NestJS + TypeScript (NOT Express)
- TypeORM (ORM — type-safe queries, no raw SQL)
- PostgreSQL 16
- class-validator + class-transformer (DTO validation)
- Jest (testing)

## Current Phase
**Phase 1 (Core Quoter)** — 6-step wizard, no pricing yet.

## Key Documents
- `PROJECT-BRIEF.md` — naming conventions & tech decisions
- `MASTER-CLAUDE-CODE-PROMPT.md` — full Phase 1 spec (NestJS version)
- `CONTRIBUTING.md` — developer workflow
- `ENVIRONMENT-SETUP.md` — env vars & database setup
- `DEPLOYMENT.md` — Vercel + Railway (after local is green)
- `claude-dev-standards.skill.md` — code quality rules
- `claude-documentation.skill.md` — auto-doc generation

## Claude Skills (invoke with /)
| Command | What it does |
|---------|-------------|
| `/docs-update` | Sync all docs after code changes |
| `/lint-test` | Run ESLint + TypeScript + Jest pipeline, report failures |
| `/lint-test fix` | Auto-fix lint, then re-run pipeline |
| `/dev-log` | Append structured session log to `docs/DEV-LOG.md` |
| `/implement <task>` | Delegate a feature/fix to the implementation agent |

## Subagents (in `.claude/agents/`)
These agents are spawned by the orchestrator to keep the main context clean.

| Agent file | Model | Responsibility |
|-----------|-------|----------------|
| `docs-agent.md` | claude-haiku-4-5-20251001 | Scans git-changed files, updates API.md / DATABASE.md / ARCHITECTURE.md / DEV-LOG.md |
| `lint-agent.md` | claude-haiku-4-5-20251001 | Runs ESLint + TypeScript + Vitest (frontend) + Jest (backend) + build. Returns pass/fail table only |
| `log-agent.md` | claude-haiku-4-5-20251001 | Checks NestJS (port 3001) + Vite (port 5173) logs AND PostgreSQL via psql CLI. Returns structured digest |
| `implementation-agent.md` | claude-sonnet-4-6 | Implements features following all Vue 3 + NestJS conventions. Reads files before writing. Runs type-check after |

**Rule:** Never commit or push without explicit user approval.

## GitNexus (Code Intelligence MCP)
GitNexus indexes the codebase into a knowledge graph and provides MCP tools so Claude Code understands every dependency, call chain, and module relationship.

**After writing new code:** run `gitnexus analyze` from the project root to re-index.
**Setup (one-time):** `gitnexus setup` — already run, MCP registered in Claude Code.

## Strict Naming Conventions
| Context | Convention | Example |
|---------|-----------|---------|
| Context | Convention | Example |
|---------|-----------|---------|
| Vue SFCs | kebab-case + .type.vue | `trim-size.step.vue`, `quote-summary.component.vue` |
| Composables | use-*.composable.ts | `use-quote-state.composable.ts` |
| Pinia stores | *.store.ts | `quote.store.ts`, `config.store.ts` |
| Backend files | kebab-case + .type.ts | `trim-size.entity.ts`, `products.service.ts` |
| Variables/functions | camelCase | `quoteState`, `getAllTrimSizes` |
| Classes/Interfaces/DTOs | PascalCase | `ProductsService`, `CreateQuoteDto` |
| NestJS decorators | as-is | `@Get('trim-sizes')`, `@Injectable()` |
| API endpoints | kebab-case | `GET /api/products/trim-sizes` |
| DB columns (SQL) | snake_case | `min_pages`, `created_at` |
| DB columns (TS) | camelCase | `minPages`, `createdAt` |

## NestJS Backend Structure
```
backend/src/
├── modules/
│   ├── products/           # products.controller.ts, .service.ts, .module.ts
│   └── quoter/             # quoter.controller.ts, .service.ts, .module.ts
├── entities/               # *.entity.ts (TypeORM)
├── database/
│   ├── migrations/
│   └── seeds/
├── common/                 # filters, pipes, decorators
├── config/
├── app.module.ts
└── main.ts
```

## Code Quality Rules (non-negotiable)
- No `any` types in TypeScript
- JSDoc on all exported classes and public methods
- `try/catch` or NestJS `HttpException` on all async operations
- No `console.log` in production code (`console.error`/`console.warn` OK)
- 70% test coverage minimum
- Repositories only — no raw SQL queries

## Dev Workflow
1. Run backend: `cd backend && npm run dev`
2. Run frontend: `cd frontend && npm run dev`
3. After changes: `/lint-test` → `/docs-update` → `/dev-log`
4. After new modules: `gitnexus analyze`
5. Commit with descriptive message

## Deployment (after local is green)
- Frontend → Vercel | Backend + DB → Railway
- Cost: $0/month on free tiers

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **book-quoter** (646 symbols, 642 relationships, 0 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({search_query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/book-quoter/context` | Codebase overview, check index freshness |
| `gitnexus://repo/book-quoter/clusters` | All functional areas |
| `gitnexus://repo/book-quoter/processes` | All execution flows |
| `gitnexus://repo/book-quoter/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
