# Book Printing Quoter

A full-stack web application for generating dynamic book printing quotes with a complete admin control panel. Built with Vue 3, NestJS, TypeScript, and PostgreSQL.

**GitHub:** https://github.com/myf1996/book-quoter

---

## Project Status

| Phase | Feature Area | Status |
|-------|-------------|--------|
| Phase 1 | 7-step quoter wizard + product catalogue | Complete |
| Phase 2 | Live pricing engine + rate tables | Complete |
| Phase 3 | JWT authentication + user profiles + quote history | Complete |
| Phase 4 | Admin panel — dashboard, product CRUD, pricing CRUD, user management | Complete |

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 16
- npm

### 1. Install dependencies

```bash
cd frontend && npm install
cd ../backend && npm install
```

### 2. Configure the backend

```bash
# backend/.env
DATABASE_URL=postgresql://user:password@localhost:5432/quoter_db
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
EMAIL_CONFIGURED=false
```

### 3. Create the database and seed it

```bash
createdb quoter_db

# Run the full seed (products + pricing rates + admin user)
cd backend
npx ts-node src/database/seeds/seed.ts
```

This creates all product options (trim sizes, cover styles, etc.), pricing rates, and an admin account:

| Field | Value |
|-------|-------|
| Email | `admin@onpress.com` |
| Password | `Admin123!` |
| Role | `admin` |

### 4. Start both servers

```bash
# Terminal 1 — Backend (port 3001)
cd backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Application Overview

### Customer-Facing

The customer experience is a single-page application with a clean top navigation and no required login until the user wants to save their quote.

#### Quoter Wizard (`/`)

A 7-step interactive wizard that builds a complete book specification:

| Step | What the customer selects |
|------|--------------------------|
| 1 | Trim size (book dimensions) + number of pages |
| 2 | Cover style (Softcover, Hardcover, Dust Jacket) |
| 3 | Cover finish (Gloss, Matte, Textured) |
| 4 | Print type (Black & White, Color) |
| 5 | Paper stock (60lb Natural, 70lb White, 80lb White) |
| 6 | Binding type (Perfect Bind, Saddle Stitch, Spiral) |
| 7 | Quantity (25, 50, 100, 250, 500, 1000) |

As the customer makes selections, the **live price breakdown sidebar** on the right updates in real time — showing page cost, cover cost, binding cost, subtotal, 8% tax, and total. The sidebar stacks below the step on mobile.

Only **active** products appear in the wizard. Inactive products (disabled by an admin) are hidden automatically.

When the customer clicks **Finish** on step 7:
- If already logged in: the quote is saved immediately, a confirmation screen is shown with the quote ID
- If not logged in: a sign-in / register modal appears, auth completes, then the quote is auto-saved

#### Authentication Modal

A tabbed sign-in / register modal that appears when a guest tries to save a quote. Also accessible from the top navigation via the **Sign In** button. Supports:

- Register with name, email, password (min 8 chars)
- Login with email + password
- Show/hide password toggle
- Inline validation with clear error messages
- Link to Forgot Password

#### My Quotes (`/my-quotes`)

A paginated list of all quotes the logged-in customer has saved, ordered newest first. Each quote card shows:

- Short quote ID (first 8 characters of UUID)
- Total price (large, prominent)
- Date created
- Page count + quantity
- Full configuration summary (trim size · cover style · cover finish · print type · paper stock · binding type) — option IDs are resolved to display names via parallel product lookups
- Expandable price breakdown (page cost, cover cost, binding cost, subtotal, tax, total)

Pagination: 20 quotes per page with Previous / Next controls and a total count.

#### Profile (`/profile`)

Two-panel settings page (stacks on mobile):

**Profile Info panel:**
- Avatar circle with initial letter
- Display name with inline edit (click pencil icon → text input → Save / Cancel)
- Email address (read-only)
- Member Since date

**Change Password panel:**
- Current password field (with show/hide toggle)
- New password field (with show/hide toggle)
- Confirm new password field (with show/hide toggle)
- Client-side validation (minimum 8 characters, passwords must match)
- Backend validation (current password checked against bcrypt hash)

#### Forgot Password (`/forgot-password`)

Two-step password reset flow:

1. Enter registered email address → receive OTP (if `EMAIL_CONFIGURED=true`) or skip OTP (if not configured)
2. Enter new password (+ OTP if email is configured) → password updated

---

### Admin Panel (`/admin/*`)

Accessible only to users with `role: admin`. All admin routes redirect to `/` if the user is not authenticated or is not an admin.

The admin panel uses a fixed left sidebar on desktop (224px wide) that collapses into a slide-in drawer on mobile, toggled by a hamburger button in the top bar.

Navigation links: **Dashboard**, **Products**, **Pricing**, **Users**, **Quotes**, **Back to App**

#### Dashboard (`/admin`)

At-a-glance overview with three stat cards:

| Stat card | What it shows |
|-----------|--------------|
| Total Users | Count of all registered users |
| Total Quotes | Count of all saved quotes |
| Total Revenue | Sum of `total_price` across all saved quotes |

Below the stats: **Recent Quotes** table — the 5 most recent quotes with Quote ID (truncated), customer name, total price, and date. Table scrolls horizontally on mobile.

#### Products (`/admin/products`)

Manage the 6 product option types that appear in the customer wizard.

**Tab bar** — switches between:
- Trim Sizes
- Cover Styles
- Cover Finishes
- Print Types
- Paper Stocks
- Binding Types

**Status filter pills** — filter the current tab's list by:
- **All** — show every record regardless of status
- **Active** — show only records visible to customers
- **Inactive** — show only disabled records

**Each product row shows:**
- UUID (hidden on small screens)
- Name
- Status badge (green "active" / gray "inactive")
- Actions: **Activate / Deactivate** toggle, **Edit** (inline name editing), **Delete** (soft delete with confirmation dialog)

**Add New** — reveals an inline form row at the top of the table. New items are created with `status: inactive` by default and must be explicitly activated before customers can see them.

#### Pricing (`/admin/pricing`)

Manage the three rate tables that drive the pricing engine. Each section has the same Add / Edit / Delete pattern.

**Page Rates**
Defines the per-page printing cost for each Print Type + Paper Stock combination (e.g., Black & White + 60lb Natural = $0.035/page). Form fields: Print Type (dropdown), Paper Stock (dropdown), Rate per Page ($).

**Cover Rates**
Flat cover cost for each Cover Style + Cover Finish combination (e.g., Softcover + Gloss = $3.50). Form fields: Cover Style (dropdown), Cover Finish (dropdown), Base Price ($).

**Binding Rates**
Flat binding surcharge per binding type (e.g., Perfect Bind = $1.50). Form fields: Binding Type (dropdown), Surcharge ($).

All dropdowns on this page only show **active** products so you can only create rates for products that customers can actually select.

#### Users (`/admin/users`)

Paginated list of all registered user accounts (20 per page), ordered newest first.

Each row shows: Name, Email, Role badge (indigo "admin" / gray "customer"), Member Since date, and two action buttons:

- **Make Admin / Make Customer** — toggles the user's role in real time (no page reload)
- **Delete** — soft deletes the user with a browser confirmation dialog

Pagination controls at the bottom (Previous / Next, page X of Y).

#### Quotes (`/admin/quotes`)

Paginated read-only view of all quotes in the system (20 per page), ordered newest first.

Each row shows: Quote ID (first 8 chars), customer name + email (stacked), page count, quantity, total price, date. Table scrolls horizontally on mobile.

---

## Testing

### Backend (Jest) — 32 tests

| Test file | What is covered |
|-----------|----------------|
| `auth.service.spec.ts` | register (success + conflict), login (success + not found + wrong password), getProfile (no passwordHash + not found), changePassword (success + wrong password) |
| `quoter.service.spec.ts` | calculatePrice (correct math, missing rate errors, FK ID lookup), saveQuote, getUserQuotes (pagination, skip calculation) |
| `admin.service.spec.ts` | getDashboardStats (revenue calc, zero revenue), getAllTrimSizes (no filter, status filter), createTrimSize, updateTrimSize (success + NotFoundException), deleteTrimSize (success + NotFoundException), getAllUsers (pagination defaults, totalPages, page 2 skip), getAllQuotes (relations, pagination), updateUserRole (success + NotFoundException) |

```bash
cd backend && npm test
```

### Frontend (Vitest) — 16 tests

`quote.store.spec.ts` covers: initial state, `isCurrentStepComplete` (8 boundary cases), `goToNextStep` (advance, block incomplete, cap at last step), `goToPreviousStep` (decrement, floor at 1), `updateQuoteState` (merge without clearing), `setPageCountBounds`.

```bash
cd frontend && npx vitest run
```

---

## Tech Stack

### Frontend (port 5173)

| Concern | Technology |
|---------|-----------|
| Framework | Vue 3 (Composition API + `<script setup>`) + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| State | Pinia (`quote.store.ts`, `auth.store.ts`) |
| Routing | Vue Router 4 |
| HTTP | Axios (proxied via Vite `/api` → `localhost:3001`) |
| Testing | Vitest + `happy-dom` environment |

### Backend (port 3001)

| Concern | Technology |
|---------|-----------|
| Framework | NestJS + TypeScript |
| ORM | TypeORM (repository pattern — no raw SQL) |
| Database | PostgreSQL 16 |
| Auth | `@nestjs/jwt` + `passport-jwt`; 7-day JWT; bcrypt password hashing |
| Validation | class-validator + class-transformer (DTO layer) |
| Testing | Jest |

---

## Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| Vue SFCs | kebab-case + `.type.vue` | `trim-size.step.vue`, `admin-layout.component.vue` |
| Composables | `use-*.composable.ts` | `use-quote-state.composable.ts` |
| Pinia stores | `*.store.ts` | `quote.store.ts`, `auth.store.ts` |
| Backend files | kebab-case + `.type.ts` | `admin.service.ts`, `trim-size.entity.ts` |
| Variables / functions | camelCase | `quoteState`, `getAllTrimSizes` |
| Classes / Interfaces / DTOs | PascalCase | `AdminService`, `CreateProductDto` |
| API endpoints | kebab-case | `GET /api/products/trim-sizes` |
| DB columns (SQL) | snake_case | `min_pages`, `created_at` |
| DB columns (TypeScript) | camelCase | `minPages`, `createdAt` |

---

## Project Structure

```
book-quoter/
├── frontend/src/
│   ├── components/
│   │   ├── steps/                    # One .step.vue per wizard step (7 total)
│   │   ├── admin-layout.component.vue  # Responsive admin shell (hamburger on mobile)
│   │   ├── auth-modal.component.vue    # Sign in / register modal (teleported to body)
│   │   ├── progress-bar.component.vue  # Wizard step progress indicator
│   │   ├── quote-summary.component.vue # Live price breakdown sidebar
│   │   ├── quoter-wizard.component.vue # Wizard orchestrator (7 steps)
│   │   └── step-navigation.component.vue  # Previous / Next / Finish buttons
│   ├── composables/
│   │   └── use-quote-state.composable.ts   # Product option fetch + state management
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── admin-dashboard.page.vue    # Stats + recent quotes
│   │   │   ├── admin-products.page.vue     # Product CRUD (6 tabs)
│   │   │   ├── admin-pricing.page.vue      # Rate table CRUD (3 sections)
│   │   │   ├── admin-users.page.vue        # User list + role management
│   │   │   └── admin-quotes.page.vue       # All quotes read-only view
│   │   ├── quoter.page.vue                 # / (quoter wizard + top nav)
│   │   ├── my-quotes.page.vue              # /my-quotes
│   │   ├── profile.page.vue                # /profile
│   │   └── forgot-password.page.vue        # /forgot-password
│   ├── stores/
│   │   ├── quote.store.ts                  # Wizard state (step, selections, bounds)
│   │   └── auth.store.ts                   # JWT token + user object
│   └── router/index.ts
│
├── backend/src/
│   ├── common/
│   │   └── enums/
│   │       └── product-status.enum.ts      # ProductStatus.ACTIVE | INACTIVE
│   ├── entities/                           # TypeORM entities (UUID PKs)
│   │   ├── user.entity.ts
│   │   ├── quote.entity.ts
│   │   ├── trim-size.entity.ts             # + status column
│   │   ├── cover-style.entity.ts           # + status column
│   │   ├── cover-finish.entity.ts          # + status column
│   │   ├── print-type.entity.ts            # + status column
│   │   ├── paper-stock.entity.ts           # + status column
│   │   ├── binding-type.entity.ts          # + status column
│   │   ├── page-rate.entity.ts
│   │   ├── cover-rate.entity.ts
│   │   └── binding-rate.entity.ts
│   ├── modules/
│   │   ├── products/     # Public catalogue endpoints (active products only)
│   │   ├── quoter/       # Price calculation + quote save/list
│   │   ├── auth/         # Register, login, profile, password
│   │   └── admin/        # Admin-only CRUD (products, rates, users, quotes)
│   └── database/
│       └── seeds/
│           ├── seed.ts           # Full seed: products + rates + admin user
│           └── pricing-seed.ts   # Rates only (legacy)
│
└── docs/
    ├── API.md
    ├── ARCHITECTURE.md
    └── DATABASE.md
```

---

## Deployment

Frontend → Vercel | Backend + PostgreSQL → Railway

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions.

---

## Documentation

| Document | Purpose |
|----------|---------|
| [docs/API.md](./docs/API.md) | Full API reference (all endpoints, request/response shapes) |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System architecture, data flows, design decisions |
| [docs/DATABASE.md](./docs/DATABASE.md) | Database schema (all tables, columns, relationships) |
| [ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md) | Environment variables and database setup |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Developer workflow and coding standards |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Vercel + Railway deployment guide |

---

**Last updated:** July 2026
