# /docs-update — Documentation Update Skill

When invoked, scan recent code changes and keep all docs in sync.

## What to do

1. **Detect changed files** by running `git diff --name-only HEAD` and `git status`.

2. **Update docs based on what changed:**

   | Changed | Update |
   |---------|--------|
   | `backend/src/modules/**` | `docs/API.md` (endpoints) + `docs/ARCHITECTURE.md` |
   | `backend/src/entities/**` | `docs/DATABASE.md` (schema) |
   | `frontend/src/components/**` | `docs/ARCHITECTURE.md` (component tree) |
   | `frontend/src/pages/**` | `docs/ARCHITECTURE.md` (page list) |
   | Any new module | Create ADR in `docs/decisions/` |

3. **API.md** — list every `@Get`, `@Post`, `@Put`, `@Delete` decorator found in controllers. Format:
   ```
   GET /api/products/trim-sizes
     Returns: TrimSize[]
     Auth: none
   ```

4. **DATABASE.md** — reflect current TypeORM entities: table name, columns, types, relations.

5. **ARCHITECTURE.md** — update:
   - Backend module tree (NestJS modules → controllers → services → entities)
   - Frontend component tree (pages → components → hooks)
   - Data flow diagram (frontend → API → service → repository → DB)

6. **ADR (Architecture Decision Record)** — if a new module, entity, or significant pattern was added, create `docs/decisions/ADR-NNN-title.md` using this template:
   ```markdown
   # ADR-NNN: Title
   **Date:** YYYY-MM-DD
   **Status:** Accepted
   ## Context
   ## Decision
   ## Consequences
   ```

7. **Validation** — after updating, confirm:
   - Every endpoint in controllers has a matching entry in API.md
   - Every entity has a matching table in DATABASE.md
   - No broken links in docs

## Rules
- Never delete existing doc content unless the code it describes was removed
- Use NestJS decorator names exactly (`@Get('trim-sizes')` → `GET /api/products/trim-sizes`)
- TypeORM column types → human-readable SQL types in DATABASE.md
- Keep docs concise — bullet points over paragraphs
