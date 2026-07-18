# Architecture — Book Printing Quoter

## Phase Status

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 — Core Quoter | Complete | 7-step wizard, product catalogue endpoints, quote configuration |
| Phase 2 — Pricing Engine | **Active** | Live price calculation, rate tables, quote persistence |
| Phase 3 — Authentication | Planned | User accounts, saved quotes |
| Phase 4 — Admin Panel | Planned | Rate management, reporting |

Feature flags are controlled in `backend/src/config/config.json`. As of Phase 2:
- `phases.phase2PricingEngine: true`
- `features.pricing.enabled: true`

---

## Tech Stack

### Frontend — port 5173

- **Framework:** Vue 3 (Composition API, `<script setup>`) + TypeScript
- **Build tool:** Vite
- **Styling:** Tailwind CSS
- **State:** Pinia (`quote.store.ts`, `config.store.ts`)
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
│       │   └── quote-summary.component.vue  # Live price breakdown (Phase 2)
│       ├── composables/
│       │   └── use-quote-price.composable.ts  # Auto-calls /calculate (Phase 2)
│       └── stores/
│           └── quote.store.ts               # QuoteState incl. pageCount + quantity
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
        │   ├── quote.entity.ts              # Extended in Phase 2
        │   ├── page-rate.entity.ts          # Phase 2
        │   ├── cover-rate.entity.ts         # Phase 2
        │   └── binding-rate.entity.ts       # Phase 2
        ├── modules/
        │   ├── products/                    # GET catalogue endpoints (Phase 1)
        │   │   ├── products.controller.ts
        │   │   ├── products.service.ts
        │   │   └── products.module.ts
        │   └── quoter/                      # POST pricing endpoints (Phase 2)
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
  → POST /api/quoter/calculate   (all 8 fields filled)
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
- **Live pricing is non-destructive** — `POST /api/quoter/calculate` never writes to the database; only `POST /api/quoter/quote` persists.
- **Feature flags** — phases and features are toggled in `config.json`, making it safe to deploy the backend before the corresponding frontend work is complete.
