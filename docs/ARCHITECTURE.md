# Architecture — Book Printing Quoter

## Phase Status

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 — Core Quoter | Complete | 7-step wizard, product catalogue endpoints, quote configuration |
| Phase 2 — Pricing Engine | Complete | Live price calculation, rate tables, quote persistence |
| Phase 3 — Authentication | **Complete** | User accounts, JWT auth, saved quotes per user |
| Phase 4 — Admin Panel | Planned | Rate management, reporting |

Feature flags are controlled in `backend/src/config/config.json`. As of Phase 3:
- `phases.phase2PricingEngine: true`
- `phases.phase3Auth: true`
- `features.pricing.enabled: true`
- `features.auth.enabled: true`

---

## Tech Stack

### Frontend — port 5173

- **Framework:** Vue 3 (Composition API, `<script setup>`) + TypeScript
- **Build tool:** Vite
- **Styling:** Tailwind CSS
- **State:** Pinia (`quote.store.ts`, `config.store.ts`, `auth.store.ts`)
- **Routing:** Vue Router 4
- **HTTP:** Axios
- **Forms:** VeeValidate
- **Testing:** Vitest + Vue Test Utils

### Backend — port 3001

- **Framework:** NestJS + TypeScript
- **ORM:** TypeORM (repository pattern — no raw SQL)
- **Database:** PostgreSQL 16
- **Validation:** class-validator + class-transformer (DTO layer)
- **Testing:** Jest

---

## Directory Structure

```
OnPress/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── steps/               # One .step.vue per wizard step
│       │   │   ├── trim-size.step.vue       # Step 1: trim size + page count
│       │   │   ├── cover-style.step.vue     # Step 2
│       │   │   ├── cover-finish.step.vue    # Step 3
│       │   │   ├── print-type.step.vue      # Step 4
│       │   │   ├── paper-stock.step.vue     # Step 5
│       │   │   ├── binding-type.step.vue    # Step 6
│       │   │   └── quantity.step.vue        # Step 7 (Phase 2)
│       │   ├── quoter-wizard.component.vue  # Wizard shell, TOTAL_STEPS=7
│       │   ├── quote-summary.component.vue  # Live price breakdown (Phase 2)
│       │   └── auth-modal.component.vue     # Login/register modal, teleported to body (Phase 3)
│       ├── composables/
│       │   └── use-quote-price.composable.ts  # Auto-calls /calculate-price (Phase 2)
│       ├── pages/
│       │   ├── my-quotes.page.vue             # /my-quotes — authenticated saved-quotes list (Phase 3)
│       │   ├── profile.page.vue               # /profile — edit name + change password (Phase 3)
│       │   └── forgot-password.page.vue       # /forgot-password — 2-step or 3-step OTP reset (Phase 3)
│       └── stores/
│           ├── quote.store.ts               # QuoteState incl. pageCount + quantity
│           └── auth.store.ts                # JWT token + user { id, name, email, role } (Phase 3)
│
└── backend/
    └── src/
        ├── entities/
        │   ├── trim-size.entity.ts
        │   ├── cover-style.entity.ts
        │   ├── cover-finish.entity.ts
        │   ├── print-type.entity.ts
        │   ├── paper-stock.entity.ts
        │   ├── binding-type.entity.ts
        │   ├── quote.entity.ts              # Extended in Phase 2 + Phase 3
        │   ├── page-rate.entity.ts          # Phase 2
        │   ├── cover-rate.entity.ts         # Phase 2
        │   ├── binding-rate.entity.ts       # Phase 2
        │   └── user.entity.ts               # Phase 3
        ├── modules/
        │   ├── products/                    # GET catalogue endpoints (Phase 1)
        │   │   ├── products.controller.ts
        │   │   ├── products.service.ts
        │   │   └── products.module.ts
        │   ├── auth/                        # JWT auth endpoints (Phase 3)
        │   │   ├── auth.controller.ts
        │   │   ├── auth.service.ts
        │   │   └── auth.module.ts
        │   └── quoter/                      # POST pricing endpoints (Phase 2); JWT-guarded in Phase 3
        │       ├── quoter.controller.ts
        │       ├── quoter.service.ts
        │       ├── quoter.module.ts
        │       └── dto/
        │           └── calculate-quote.dto.ts
        ├── database/
        │   ├── migrations/
        │   └── seeds/
        │       └── pricing-seed.ts          # Phase 2: 18 rate rows
        ├── common/                          # Filters, pipes, decorators
        ├── config/
        │   └── config.json                  # Phase flags + feature toggles
        ├── app.module.ts
        └── main.ts
```

---

## Frontend Routes

| Path | Component | Auth required | Description |
|------|-----------|---------------|-------------|
| `/` | `quoter-wizard.component.vue` | No | 7-step quoter wizard |
| `/my-quotes` | `my-quotes.page.vue` | Yes | Saved quotes for authenticated user |
| `/profile` | `profile.page.vue` | Yes | Edit name, change password, member since |
| `/forgot-password` | `forgot-password.page.vue` | No | 2-step (or 3-step with OTP) password reset |

---

## Request Flow

### Phase 1 — Wizard Step Load

```
Browser → GET /api/products/<resource>
       → ProductsController
       → ProductsService.getAll*()
       → TypeORM Repository → PostgreSQL
       → TrimSize[] / CoverStyle[] / ...
```

### Phase 2 — Live Price Calculation

```
Browser (quote store change)
  → useQuotePrice composable (watches quoteState, debounced)
  → POST /api/quoter/calculate-price   (all 8 fields filled)
  → QuoterController.calculatePrice()
  → QuoterService.calculatePrice()
      ├── pageRateRepo.findOne({ printTypeId, paperStockId })
      ├── coverRateRepo.findOne({ coverStyleId, coverFinishId })
      └── bindingRateRepo.findOne({ bindingTypeId })
  → pricing formula applied
  → PriceBreakdown returned
  → quote-summary.component.vue renders live breakdown
```

### Phase 2 — Save Quote

```
Browser → POST /api/quoter/quote
       → QuoterController.saveQuote()
       → QuoterService.saveQuote()
           → calculatePrice() (rate lookups as above)
           → quoteRepo.create() + quoteRepo.save()
       → Quote entity (id + priceBreakdown) returned
```

---

## Pricing Formula

```
pageCost    = ratePerPage × pageCount
coverCost   = coverRate.basePrice
bindingCost = bindingRate.surcharge
subtotal    = (pageCost + coverCost + bindingCost) × quantity
tax         = subtotal × 0.08   (8%)
total       = subtotal + tax
```

All intermediate values are rounded to 2 decimal places using `Math.round(x * 100) / 100`.

---

## Key Design Decisions

- **No raw SQL** — all database access via TypeORM repositories.
- **No `any` types** — strict TypeScript throughout.
- **DTO validation** — `class-validator` enforces field constraints before any business logic runs.
- **Rate tables are decoupled** — `page_rates`, `cover_rates`, and `binding_rates` reference catalogue IDs logically (no FK constraints), keeping migrations simple and seeds independent.
- **Live pricing is non-destructive** — `POST /api/quoter/calculate-price` never writes to the database; only `POST /api/quoter/quote` persists.
- **Feature flags** — phases and features are toggled in `config.json`, making it safe to deploy the backend before the corresponding frontend work is complete.
- **`BaseAppEntity`** — abstract TypeORM class extended by all 11 entities; provides `createdAt` (auto) + `deletedAt` (soft-delete via `@DeleteDateColumn`).
- **`SnakeNamingStrategy`** — `typeorm-naming-strategies` package applied globally; auto-translates camelCase TypeScript property names to `snake_case` DB column names with zero decorator noise.
- **JWT auth** — `@nestjs/jwt` + `passport-jwt`; 7-day expiry; token payload includes `{ sub, email, role }`; stored in `localStorage` on the frontend.
- **`UserRole` enum** — `admin` | `customer`; default `customer`; included in JWT payload and returned on every auth response.
- **`RolesGuard` + `@Roles()` decorator** — located in `backend/src/common/`; used to protect admin-only routes in Phase 4.
- **`EMAIL_CONFIGURED` env flag** — when `true`, `POST /api/auth/forgot-password` emails a 6-digit OTP and `POST /api/auth/reset-password` validates it; when `false` the reset flow is OTP-free.
- **OTP store** — in-memory `Map` on `AuthService` with a 10-minute expiry; intentionally non-persistent (acceptable for Phase 3, replaceable with Redis in production).
- **`synchronize`** — `true` in development (schema auto-syncs on startup), `false` in production (migrations only).
