# Architecture — Book Printing Quoter

## Phase Status

| Phase | Feature Area | Status |
|-------|-------------|--------|
| Phase 1 | 7-step quoter wizard + product catalogue endpoints | Complete |
| Phase 2 | Live pricing engine + rate tables + quote persistence | Complete |
| Phase 3 | JWT authentication + user profiles + quote history + password reset | Complete |
| Phase 4 | Admin panel (dashboard, product CRUD, pricing CRUD, user management, quotes view + detail, coupon CRUD) | Complete |

---

## Tech Stack

### Frontend — port 5173

| Concern | Technology |
|---------|-----------|
| Framework | Vue 3 (Composition API, `<script setup>`) + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| State | Pinia (`quote.store.ts`, `auth.store.ts`) |
| Routing | Vue Router 4 |
| HTTP | Axios (all requests proxied via Vite `/api` → `http://localhost:3001`) |
| Testing | Vitest + `happy-dom` environment |
| Linting | ESLint + Prettier |

### Backend — port 3001

| Concern | Technology |
|---------|-----------|
| Framework | NestJS + TypeScript |
| ORM | TypeORM (repository pattern — no raw SQL) |
| Database | PostgreSQL 16 |
| Auth | `@nestjs/jwt` + `passport-jwt`; 7-day expiry; bcrypt password hashing |
| Validation | class-validator + class-transformer (DTO layer) |
| Testing | Jest |
| Linting | ESLint + Prettier |

---

## Directory Structure

```
OnPress/
├── frontend/src/
│   ├── components/
│   │   ├── steps/
│   │   │   ├── trim-size.step.vue          # Step 1: trim size selection + page count input
│   │   │   ├── cover-style.step.vue        # Step 2
│   │   │   ├── cover-finish.step.vue       # Step 3
│   │   │   ├── print-type.step.vue         # Step 4
│   │   │   ├── paper-stock.step.vue        # Step 5
│   │   │   ├── binding.step.vue            # Step 6
│   │   │   └── quantity.step.vue           # Step 7
│   │   ├── admin-layout.component.vue      # Admin shell: fixed sidebar (lg+) / hamburger drawer (mobile)
│   │   ├── auth-modal.component.vue        # Sign in / register modal; Teleported to <body>
│   │   ├── progress-bar.component.vue      # Wizard step progress indicator
│   │   ├── quote-summary.component.vue     # Live price breakdown sidebar
│   │   ├── quoter-wizard.component.vue     # Wizard orchestrator (7 steps, finish handler)
│   │   └── step-navigation.component.vue  # Previous / Next / Finish buttons
│   ├── composables/
│   │   └── use-quote-state.composable.ts  # Fetches product options, exposes isLoading/error/options
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── admin-dashboard.page.vue        # /admin — stats cards + recent quotes table
│   │   │   ├── admin-products.page.vue         # /admin/products — 6-tab product CRUD
│   │   │   ├── admin-pricing.page.vue          # /admin/pricing — page/cover/binding rate CRUD
│   │   │   ├── admin-users.page.vue            # /admin/users — paginated user list + role management
│   │   │   ├── admin-quotes.page.vue           # /admin/quotes — paginated all-quotes with user/coupon filters
│   │   │   ├── admin-quote-detail.page.vue     # /admin/quotes/:id — full quote detail view
│   │   │   └── admin-coupons.page.vue          # /admin/coupons — coupon CRUD with code/status filter
│   │   ├── quoter.page.vue                # / — wizard page + top nav
│   │   ├── my-quotes.page.vue             # /my-quotes — authenticated user's quote history
│   │   ├── profile.page.vue               # /profile — edit name + change password
│   │   └── forgot-password.page.vue       # /forgot-password — 2/3-step password reset
│   ├── stores/
│   │   ├── quote.store.ts                 # currentStep, quoteState, pageCountBounds, actions
│   │   └── auth.store.ts                  # JWT token + user object; fetchCurrentUser on app boot
│   ├── router/index.ts                    # Vue Router routes (/, /my-quotes, /profile, /forgot-password, /admin/*)
│   └── utils/
│       └── helpers.utils.ts               # Axios instance with /api base URL
│
└── backend/src/
    ├── common/
    │   ├── enums/
    │   │   └── product-status.enum.ts     # ProductStatus.ACTIVE = 'active' | INACTIVE = 'inactive'
    │   ├── filters/                       # Global exception filters
    │   ├── guards/
    │   │   ├── jwt-auth.guard.ts          # Passport JWT guard
    │   │   └── roles.guard.ts             # Role-based access (admin only)
    │   └── decorators/
    │       └── roles.decorator.ts         # @Roles('admin') decorator
    ├── entities/                          # All extend BaseAppEntity (id, status, createdAt, updatedAt, deletedAt)
    │   ├── base-app.entity.ts             # Abstract base: id (uuid PK), status, createdAt, updatedAt, deletedAt
    │   ├── user.entity.ts                 # name, email, passwordHash, role + base columns
    │   ├── quote.entity.ts                # 6 product ManyToOne FKs (NOT NULL, RESTRICT, eager), pageCount, quantity, totalPrice, priceBreakdown (jsonb), couponCode, discountAmount, user FK (nullable, RESTRICT)
    │   ├── coupon.entity.ts               # code (unique), discountType, discountValue, applicableUser FK (nullable, RESTRICT), maxUsesPerUser, totalMaxUses, expiresAt
    │   ├── coupon-usage.entity.ts         # coupon FK (RESTRICT), user FK (RESTRICT), quote FK nullable (RESTRICT); createdAt = usedAt
    │   ├── trim-size.entity.ts            # name, width, height, minPages, maxPages + base columns
    │   ├── cover-style.entity.ts          # name + base columns
    │   ├── cover-finish.entity.ts         # name + base columns
    │   ├── print-type.entity.ts           # name + base columns
    │   ├── paper-stock.entity.ts          # name, weight + base columns
    │   ├── binding-type.entity.ts         # name + base columns
    │   ├── page-rate.entity.ts            # printType FK (RESTRICT), paperStock FK (RESTRICT), ratePerPage
    │   ├── cover-rate.entity.ts           # coverStyle FK (RESTRICT), coverFinish FK (RESTRICT), basePrice
    │   └── binding-rate.entity.ts         # bindingType FK (RESTRICT), surcharge
    ├── modules/
    │   ├── products/
    │   │   ├── products.controller.ts     # GET /api/products/* (no auth required)
    │   │   ├── products.service.ts        # Filters by status=active before returning to customers
    │   │   └── products.module.ts
    │   ├── quoter/
    │   │   ├── quoter.controller.ts       # POST /calculate-price (public), POST /quote (JWT), GET /quotes (JWT)
    │   │   ├── quoter.service.ts          # calculatePrice(), saveQuote(), getUserQuotes()
    │   │   ├── quoter.module.ts
    │   │   └── dto/
    │   │       └── calculate-quote.dto.ts # All 6 UUID IDs + pageCount + quantity
    │   ├── auth/
    │   │   ├── auth.controller.ts         # /register /login /me /profile /password /forgot-password /reset-password
    │   │   ├── auth.service.ts            # JWT issuance, bcrypt hashing, OTP store (in-memory Map)
    │   │   ├── auth.module.ts
    │   │   └── strategies/
    │   │       └── jwt.strategy.ts        # Passport JWT strategy
    │   └── admin/
    │       ├── admin.controller.ts        # All /admin/* routes (JWT + admin role guard)
    │       ├── admin.service.ts           # getDashboardStats, product CRUD, rate CRUD, user management, getAllQuotes, coupon CRUD
    │       ├── admin.module.ts
    │       └── dto/                       # Create/Update DTOs for all product types, rates, and coupons
    ├── database/
    │   └── seeds/
    │       ├── seed.ts                    # Full seed: 6 product types (all ACTIVE) + 18 rate rows + admin user
    │       └── pricing-seed.ts            # Rates-only seed (legacy)
    ├── config/
    │   └── typeorm.config.ts
    ├── app.module.ts
    └── main.ts
```

---

## Frontend Routes

| Path | Page | Auth required | Role required |
|------|------|--------------|--------------|
| `/` | `quoter.page.vue` | No | — |
| `/my-quotes` | `my-quotes.page.vue` | Yes | customer or admin |
| `/profile` | `profile.page.vue` | Yes | customer or admin |
| `/forgot-password` | `forgot-password.page.vue` | No | — |
| `/admin` | `admin-dashboard.page.vue` | Yes | admin |
| `/admin/products` | `admin-products.page.vue` | Yes | admin |
| `/admin/pricing` | `admin-pricing.page.vue` | Yes | admin |
| `/admin/users` | `admin-users.page.vue` | Yes | admin |
| `/admin/quotes` | `admin-quotes.page.vue` | Yes | admin |
| `/admin/quotes/:id` | `admin-quote-detail.page.vue` | Yes | admin |
| `/admin/coupons` | `admin-coupons.page.vue` | Yes | admin |

All admin routes redirect to `/` if the user is unauthenticated or is not an admin (enforced in `onMounted`).

---

## Request Flows

### Customer — Wizard Step Load

```
Browser
  → GET /api/products/<resource>        (e.g. /trim-sizes)
  → ProductsController
  → ProductsService.getAll*()
      → repo.find({ where: { status: ProductStatus.ACTIVE } })
  → TrimSize[] (active only)
  → step component renders option cards
```

---

### Customer — Live Price Calculation

```
Browser (quoteState change in Pinia store)
  → useQuotePrice composable (watches all 8 fields)
  → POST /api/quoter/calculate-price
  → QuoterController.calculatePrice()
  → QuoterService.calculatePrice()
      ├── pageRateRepo.findOne({ where: { printType: { id }, paperStock: { id } } })
      ├── coverRateRepo.findOne({ where: { coverStyle: { id }, coverFinish: { id } } })
      └── bindingRateRepo.findOne({ where: { bindingType: { id } } })
  → pricing formula applied
  → { pageCost, coverCost, bindingCost, subtotal, tax, total }
  → quote-summary.component.vue renders the live breakdown
```

---

### Customer — Save Quote (authenticated)

```
Browser (Finish button, user already logged in)
  → POST /api/quoter/quote  (Bearer JWT in header)
  → JwtAuthGuard validates token
  → QuoterController.saveQuote()
  → QuoterService.saveQuote()
      → calculatePrice() (rate lookups as above)
      → quoteRepo.create({ ...dto, totalPrice, priceBreakdown, user: { id: req.user.id } })
      → quoteRepo.save()
  → Saved Quote entity returned
  → Wizard shows "Quote Saved!" confirmation screen with quote ID
```

---

### Customer — Save Quote (unauthenticated)

```
Browser (Finish button, no session)
  → showAuthModal = true
  → AuthModal shown (sign in / register)
  → On successful auth: authStore.login() or authStore.register()
      → POST /api/auth/login or /api/auth/register
      → JWT stored in localStorage under key 'auth_token'
  → onSuccess callback fires → saveQuote() called as above
  → Quote saved, confirmation shown
```

---

### Customer — My Quotes Page

```
Browser (navigates to /my-quotes)
  → authStore.isAuthenticated check → redirect to / if false
  → GET /api/quoter/quotes?page=1&limit=20  (JWT required)
  → Quote objects include product name objects directly (trimSize.name, coverStyle.name, etc.)
     — no secondary lookup calls needed
  → Quotes rendered as cards with configSummary built from relation objects
  → Pagination controls shown when totalPages > 1
```

---

### Admin — Dashboard

```
Browser (navigates to /admin)
  → role check: redirect to / if not admin
  → Parallel requests:
      GET /api/admin/dashboard
      GET /api/admin/quotes?page=1&limit=5
  → DashboardStats: { totalUsers, totalQuotes, totalRevenue }
  → Recent 5 quotes shown in a table
```

---

### Admin — Product Management

```
Browser (navigates to /admin/products, selects a tab)
  → GET /api/admin/{resource}[?status=active|inactive]
  → Items rendered in table with Name, Status badge, Actions

Create:   POST /api/admin/{resource}  { name } → new row with status:inactive
Edit:     PATCH /api/admin/{resource}/:id  { name } → row updates inline
Toggle:   PATCH /api/admin/{resource}/:id  { status: 'active'|'inactive' }
Delete:   DELETE /api/admin/{resource}/:id  (soft delete, row removed)
```

---

### Admin — User Management

```
Browser (navigates to /admin/users)
  → GET /api/admin/users?page=1&limit=20
  → PaginatedResponse<UserView> rendered in table

Toggle role:  PATCH /api/admin/users/:id/role  { role: 'admin'|'customer' }
Delete:       DELETE /api/admin/users/:id
```

---

## Pricing Formula

```
pageCost    = pageRate.ratePerPage × pageCount
coverCost   = coverRate.basePrice
bindingCost = bindingRate.surcharge
subtotal    = (pageCost + coverCost + bindingCost) × quantity
tax         = subtotal × 0.08   (8%)
total       = subtotal + tax
```

All intermediate values are rounded to 2 decimal places using `Math.round(x * 100) / 100`.

---

## Pagination

All list endpoints that can return large datasets implement the same pagination pattern:

- Query params: `page` (default `1`) and `limit` (default `20`)
- Service uses TypeORM `findAndCount()` with `skip = (page - 1) * limit` and `take = limit`
- Response shape: `{ data, total, page, limit, totalPages }`
- Frontend uses `computed` `hasPrev` / `hasNext` booleans and a `goToPage()` function

Paginated endpoints: `GET /admin/users`, `GET /admin/quotes`, `GET /quoter/quotes`.

---

## Authentication Architecture

```
Frontend                          Backend
--------                          -------
authStore.login(email, pw)
  → POST /api/auth/login
                              → AuthService.login()
                                  → userRepo.findOne({ email })
                                  → bcrypt.compare(pw, hash)
                                  → jwtService.sign({ sub, email, role })
  ← { accessToken, user }
  → localStorage.setItem('auth_token', token)
  → authStore.user = user

Subsequent requests:
axios.defaults.headers.Authorization = `Bearer ${token}`
  → JwtAuthGuard.canActivate()
      → JwtStrategy.validate({ sub, email, role })
      → req.user = { id: sub, email, role }
```

On app boot (`main.ts`), `authStore.fetchCurrentUser()` is called before the router and Vue app are mounted. This silently restores a session from localStorage if the stored token is still valid.

---

## Responsive Design

### Customer Pages

- `max-w-5xl mx-auto px-4` container on all customer pages
- Quoter wizard: `flex flex-col lg:flex-row` — summary sidebar stacks below on mobile, sits right on desktop
- Step option grids: `grid-cols-1 sm:grid-cols-2` or `grid-cols-2 sm:grid-cols-3`
- My Quotes cards: `flex-col sm:flex-row` header row, `overflow-x-auto` not needed (card layout)
- Auth modal: `max-w-md w-full` with `p-4` viewport padding — fits all phone sizes
- Navigation links: username hidden below `sm:` breakpoint (`hidden sm:inline`)

### Admin Panel

- **Sidebar:** `w-56 fixed inset-y-0 left-0` on `lg+`. On `< lg`: `-translate-x-full` (hidden), toggles to `translate-x-0` via hamburger button. Backdrop overlay (`bg-black/50`) closes the drawer on tap.
- **Mobile top bar:** `sticky top-0 lg:hidden` strip containing the hamburger button and "Book Quoter Admin" label.
- **Main content:** `flex-1 lg:ml-56` — no left margin on mobile (sidebar is out of flow).
- **Page padding:** `p-4 sm:p-6 lg:p-8` on all 5 admin pages.
- **Tables:** All wrapped in `<div class="overflow-x-auto">` with `min-w-*` so they scroll horizontally on small screens. UUID columns hidden below `sm:` (`hidden sm:table-cell`).
- **Form grids:** `grid-cols-1 sm:grid-cols-3` (pricing forms), `flex-wrap` on filter + button rows.

---

## Key Design Decisions

**UUID primary keys** — All 13 entities inherit `@PrimaryGeneratedColumn('uuid')` from `BaseAppEntity`. UUIDs make IDs safe to expose publicly, support distributed generation without coordination, and prevent ID enumeration.

**`BaseAppEntity` centralization** — Every entity extends a single abstract base class that provides `id`, `status`, `createdAt`, `updatedAt`, and `deletedAt`. This eliminates per-entity decorator boilerplate and ensures all tables have a consistent set of audit columns.

**ProductStatus enum on all entities** — `BaseAppEntity` injects a `status: ProductStatus` column (`active` | `inactive`) on every table. For product option entities the value drives visibility in the customer wizard. For other entities (quotes, coupons, coupon_usages) it is inherited but reserved for future business logic.

**Quote FK relations instead of JSONB config** — The `Quote` entity has 6 proper TypeORM `ManyToOne` relations (NOT NULL, `eager: true`, `onDelete: RESTRICT`) pointing to the 6 product tables. Eager loading means product names are always included in responses without extra joins or client-side lookup maps — the API returns `{ trimSize: { id, name }, ... }` directly.

**`onDelete: RESTRICT` on all ManyToOne relations** — Every foreign key in every entity uses `RESTRICT`. PostgreSQL will block deletion of any referenced record. This is the safest default: it forces explicit cleanup before deletion rather than silently nullifying or cascading.

**Soft deletes** — `BaseAppEntity` provides `@DeleteDateColumn() deletedAt`. All deletes are soft: the record remains in the database with a timestamp but is excluded from all queries (TypeORM `SoftRemove` / `softDelete` + `withDeleted: false` by default).

**No raw SQL** — All database access goes through TypeORM repositories. `findOne`, `find`, `findAndCount`, `save`, `softDelete` cover every use case.

**`SnakeNamingStrategy`** — Applied globally from `typeorm-naming-strategies`. All camelCase TypeScript property names automatically become `snake_case` column names with zero decorator noise.

**DTO validation** — `class-validator` decorators on every DTO, applied globally via `ValidationPipe`. All validation errors return `400 Bad Request` before any business logic runs.

**`PaginatedResponse<T>` generic** — Consistent pagination shape across all paginated endpoints. The `paginate<T>()` private helper in `AdminService` keeps this DRY.

**Live pricing is non-destructive** — `POST /api/quoter/calculate-price` never writes to the database. Only `POST /api/quoter/quote` persists. This makes it safe to call the calculate endpoint on every wizard state change.

**OTP store** — In-memory `Map<email, { otp, expiresAt }>` on `AuthService` with a 10-minute expiry. Intentionally non-persistent (acceptable for current scale; replaceable with Redis in production). Skipped entirely when `EMAIL_CONFIGURED=false`.

**`synchronize: true` in development** — TypeORM auto-syncs the schema on every restart in `development` mode. Set to `false` in production (use migrations instead).

**Admin session recovery** — `authStore.fetchCurrentUser()` is called in `main.ts` before `app.mount()`. The router and Vue app are not mounted until the auth check resolves, preventing flash of unauthenticated content on page reload.

---

## Test Coverage

### Backend — Jest (32 tests)

| File | Tests |
|------|-------|
| `auth.service.spec.ts` | register (success + conflict), login (success + not found + wrong password), getProfile (excludes passwordHash + not found), changePassword (success + wrong password) |
| `quoter.service.spec.ts` | calculatePrice (correct math, missing page/cover/binding rate errors, FK ID lookup), saveQuote, getUserQuotes (pagination, skip for page 3) |
| `admin.service.spec.ts` | getDashboardStats (revenue calc, zero revenue), getAllTrimSizes (no filter, status filter), createTrimSize, updateTrimSize (success + NotFoundException), deleteTrimSize (success + NotFoundException), getAllUsers (pagination defaults, totalPages=3 for 45 records, skip for page 2), getAllQuotes (user relation, pagination), updateUserRole (success + NotFoundException) |

### Frontend — Vitest (16 tests)

| File | Tests |
|------|-------|
| `quote.store.spec.ts` | initial state (step 1, all nulls), isCurrentStepComplete (8 boundary cases including min/max page bounds), goToNextStep (advance, block when incomplete, cap at totalSteps), goToPreviousStep (decrement, floor at 1), updateQuoteState (merge without clearing other fields), setPageCountBounds |
