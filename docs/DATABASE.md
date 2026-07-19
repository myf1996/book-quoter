# Database Reference — Book Printing Quoter

**DBMS:** PostgreSQL 16  
**ORM:** TypeORM (type-safe repositories, no raw SQL)  
**Database name (local):** `quoter_db`

---

## Entity Base Class

All 13 entities extend **`BaseAppEntity`** (abstract TypeORM class at `backend/src/entities/base-app.entity.ts`), which provides:

| Column | SQL type | Notes |
|--------|----------|-------|
| `id` | `uuid` PK | Auto-generated UUID (`@PrimaryGeneratedColumn('uuid')`) |
| `status` | `enum('active','inactive')` | `ProductStatus` enum, default `active` (`@Column`) |
| `created_at` | `timestamp` | Auto-set on insert (`@CreateDateColumn`) |
| `updated_at` | `timestamp` | Auto-updated on every save (`@UpdateDateColumn`) |
| `deleted_at` | `timestamp` nullable | Soft-delete (`@DeleteDateColumn`) — set on delete, `null` for active records |

**`SnakeNamingStrategy`** from `typeorm-naming-strategies` is applied globally — all camelCase TypeScript properties map to `snake_case` columns automatically (e.g. `createdAt` → `created_at`).

**UUID primary keys** — All entities inherit `@PrimaryGeneratedColumn('uuid')` from `BaseAppEntity`. PKs are `uuid` in PostgreSQL, `string` in TypeScript.

---

## `ProductStatus` Enum

All entities inherit a `status` column from `BaseAppEntity` using this enum:

```typescript
export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}
```

For the 6 product option entities (`trim_sizes`, `cover_styles`, `cover_finishes`, `print_types`, `paper_stocks`, `binding_types`):
- `active` — visible in the customer wizard via `GET /api/products/*`
- `inactive` — hidden from customers; only visible in admin endpoints
- New records created by admins default to `inactive`

For non-product entities (`quotes`, `coupons`, `coupon_usages`, rate tables), the `status` column is inherited but not currently used for filtering — it is reserved for future business logic.

---

## Users Table

Stores registered user accounts.

**Entity:** `backend/src/entities/user.entity.ts`

| Column | SQL type | TS type | Notes |
|--------|----------|---------|-------|
| `id` | `uuid` PK | `string` | Auto-generated UUID |
| `name` | `varchar(255)` NOT NULL | `string` | Display name |
| `email` | `varchar(255)` UNIQUE NOT NULL | `string` | Login identifier |
| `password_hash` | `varchar(255)` NOT NULL | `string` | bcrypt hash — **never returned by the API** |
| `role` | `enum('admin','customer')` NOT NULL | `UserRole` | Default `'customer'`; included in JWT payload |
| `created_at` | `timestamp` | `Date` | Via `BaseAppEntity` |
| `deleted_at` | `timestamp` nullable | `Date \| null` | Soft-delete via `BaseAppEntity` |

**`UserRole` enum:**
```typescript
export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}
```

The `passwordHash` field is excluded from every API response via TypeScript destructuring in `AuthService`.

**Seed:** The `seed.ts` script creates `admin@onpress.com` / `Admin123!` as an admin user if it does not already exist.

---

## Quotes Table

Stores completed quote configurations and their calculated prices.

**Entity:** `backend/src/entities/quote.entity.ts`

| Column | SQL type | TS type | Notes |
|--------|----------|---------|-------|
| `id` | `uuid` PK | `string` | Via `BaseAppEntity` |
| `trim_size_id` | `uuid` NOT NULL | `string` | FK → `trim_sizes.id`; `onDelete: RESTRICT` |
| `cover_style_id` | `uuid` NOT NULL | `string` | FK → `cover_styles.id`; `onDelete: RESTRICT` |
| `cover_finish_id` | `uuid` NOT NULL | `string` | FK → `cover_finishes.id`; `onDelete: RESTRICT` |
| `print_type_id` | `uuid` NOT NULL | `string` | FK → `print_types.id`; `onDelete: RESTRICT` |
| `paper_stock_id` | `uuid` NOT NULL | `string` | FK → `paper_stocks.id`; `onDelete: RESTRICT` |
| `binding_type_id` | `uuid` NOT NULL | `string` | FK → `binding_types.id`; `onDelete: RESTRICT` |
| `page_count` | `integer` | `number` | Number of pages in the book |
| `quantity` | `integer` | `number` | Print run quantity |
| `total_price` | `decimal(10,2)` | `number` | Final price after tax |
| `price_breakdown` | `jsonb` | `PriceBreakdown` | Full line-item breakdown (see below) |
| `coupon_code` | `varchar` nullable | `string \| null` | Code of the coupon applied at save time; null if none |
| `discount_amount` | `decimal(10,2)` nullable | `number \| null` | Discount amount deducted; null if no coupon used |
| `user_id` | `uuid` nullable | `string \| null` | FK → `users.id`; `onDelete: RESTRICT`; null for pre-auth quotes |
| `status` | `enum('active','inactive')` | `ProductStatus` | Via `BaseAppEntity` (default `active`) |
| `created_at` | `timestamp` | `Date` | Via `BaseAppEntity` |
| `updated_at` | `timestamp` | `Date` | Via `BaseAppEntity` |
| `deleted_at` | `timestamp` nullable | `Date \| null` | Soft-delete via `BaseAppEntity` |

All 6 product FK relations are loaded eagerly (`eager: true`) so the full product object (id + name) is always included in API responses without a separate join.

**`PriceBreakdown` shape (stored as JSONB):**
```typescript
{
  pageCost: number      // ratePerPage × pageCount
  coverCost: number     // coverRate.basePrice
  bindingCost: number   // bindingRate.surcharge
  subtotal: number      // (pageCost + coverCost + bindingCost) × quantity
  tax: number           // subtotal × 0.08
  total: number         // subtotal + tax
}
```

---

## Coupons Table

Stores discount coupon definitions.

**Entity:** `backend/src/entities/coupon.entity.ts`

| Column | SQL type | TS type | Notes |
|--------|----------|---------|-------|
| `id` | `uuid` PK | `string` | Via `BaseAppEntity` |
| `code` | `varchar(255)` UNIQUE | `string` | Stored uppercase; unique coupon code |
| `discount_type` | `enum('fixed','percentage')` | `DiscountType` | Fixed dollar or percentage discount |
| `discount_value` | `decimal(10,2)` | `number` | Dollar amount (fixed) or percentage value (percentage) |
| `applicable_user_id` | `uuid` nullable | `string \| null` | FK → `users.id`; `onDelete: RESTRICT`; null = available to all users |
| `max_uses_per_user` | `integer` | `number` | Default `1` |
| `total_max_uses` | `integer` nullable | `number \| null` | Max redemptions across all users; null = unlimited |
| `expires_at` | `timestamp` nullable | `Date \| null` | Optional expiry; null = never expires |
| `status` | `enum('active','inactive')` | `ProductStatus` | Via `BaseAppEntity`; `active` = redeemable |
| `created_at` | `timestamp` | `Date` | Via `BaseAppEntity` |
| `updated_at` | `timestamp` | `Date` | Via `BaseAppEntity` |
| `deleted_at` | `timestamp` nullable | `Date \| null` | Soft-delete via `BaseAppEntity` |

**`DiscountType` enum:**
```typescript
export enum DiscountType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
}
```

---

## Coupon Usages Table

Records each redemption of a coupon against a saved quote.

**Entity:** `backend/src/entities/coupon-usage.entity.ts`

| Column | SQL type | TS type | Notes |
|--------|----------|---------|-------|
| `id` | `uuid` PK | `string` | Via `BaseAppEntity` |
| `coupon_id` | `uuid` | `string` | FK → `coupons.id`; `onDelete: RESTRICT` |
| `user_id` | `uuid` | `string` | FK → `users.id`; `onDelete: RESTRICT` |
| `quote_id` | `uuid` nullable | `string \| null` | FK → `quotes.id`; `onDelete: RESTRICT` |
| `status` | `enum('active','inactive')` | `ProductStatus` | Via `BaseAppEntity` |
| `created_at` | `timestamp` | `Date` | Via `BaseAppEntity`; serves as `usedAt` timestamp |
| `updated_at` | `timestamp` | `Date` | Via `BaseAppEntity` |
| `deleted_at` | `timestamp` nullable | `Date \| null` | Soft-delete via `BaseAppEntity` |

---

## Product Catalogue Tables

These 6 tables store the option sets that populate each step of the customer wizard. All share the same base structure plus the `status` column.

### trim_sizes

| Column | SQL type | TS type | Notes |
|--------|----------|---------|-------|
| `id` | `uuid` PK | `string` | |
| `name` | `varchar(100)` UNIQUE | `string` | e.g. `"Digest 5.5×8.5"` |
| `width` | `decimal(5,2)` | `number` | Book width in inches |
| `height` | `decimal(5,2)` | `number` | Book height in inches |
| `min_pages` | `integer` | `number` | Default `24` |
| `max_pages` | `integer` | `number` | Default `840` |
| `status` | `enum('active','inactive')` | `ProductStatus` | Default `inactive` |
| `created_at` | `timestamp` | `Date` | |
| `deleted_at` | `timestamp` nullable | `Date \| null` | |

**Seeded records (all `active`):**

| Name | Width | Height | Min Pages | Max Pages |
|------|-------|--------|-----------|-----------|
| Digest 5.5×8.5 | 5.50 | 8.50 | 24 | 840 |
| Trade 6×9 | 6.00 | 9.00 | 24 | 840 |
| Large 8.5×11 | 8.50 | 11.00 | 24 | 600 |
| Hardcover 6×9 | 6.00 | 9.00 | 48 | 600 |
| Square 8×8 | 8.00 | 8.00 | 24 | 400 |

---

### cover_styles

| Column | SQL type | TS type | Notes |
|--------|----------|---------|-------|
| `id` | `uuid` PK | `string` | |
| `name` | `varchar(100)` UNIQUE | `string` | |
| `status` | `enum('active','inactive')` | `ProductStatus` | Default `inactive` |
| `created_at` | `timestamp` | `Date` | |
| `deleted_at` | `timestamp` nullable | `Date \| null` | |

**Seeded records (all `active`):** Softcover, Hardcover, Dust Jacket

---

### cover_finishes

Same structure as `cover_styles`.

**Seeded records (all `active`):** Gloss, Matte, Textured

---

### print_types

Same structure as `cover_styles`.

**Seeded records (all `active`):** Black & White, Color

---

### paper_stocks

| Column | SQL type | TS type | Notes |
|--------|----------|---------|-------|
| `id` | `uuid` PK | `string` | |
| `name` | `varchar(100)` UNIQUE | `string` | |
| `weight` | `varchar(50)` nullable | `string \| null` | e.g. `"60lb"` |
| `status` | `enum('active','inactive')` | `ProductStatus` | Default `inactive` |
| `created_at` | `timestamp` | `Date` | |
| `deleted_at` | `timestamp` nullable | `Date \| null` | |

**Seeded records (all `active`):** 60lb Natural, 70lb White, 80lb White

---

### binding_types

Same structure as `cover_styles`.

**Seeded records (all `active`):** Perfect Bind, Saddle Stitch, Spiral

---

## Pricing Rate Tables

Three tables that power the pricing engine. Seeded via `backend/src/database/seeds/seed.ts`.

### page_rates

Per-page printing cost for each Print Type + Paper Stock combination.

**Entity:** `backend/src/entities/page-rate.entity.ts`

| Column | SQL type | TS type | Notes |
|--------|----------|---------|-------|
| `id` | `uuid` PK | `string` | |
| `print_type_id` | `uuid` | `string` | FK → `print_types.id` |
| `paper_stock_id` | `uuid` | `string` | FK → `paper_stocks.id` |
| `rate_per_page` | `decimal(8,4)` | `number` | Cost per page in USD |
| `created_at` | `timestamp` | `Date` | |
| `deleted_at` | `timestamp` nullable | `Date \| null` | |

**Seeded records (6 rows):**

| Print Type | Paper Stock | Rate / Page |
|------------|-------------|-------------|
| Black & White | 60lb Natural | $0.0350 |
| Black & White | 70lb White | $0.0400 |
| Black & White | 80lb White | $0.0450 |
| Color | 60lb Natural | $0.0850 |
| Color | 70lb White | $0.0950 |
| Color | 80lb White | $0.1050 |

---

### cover_rates

Flat cover cost for each Cover Style + Cover Finish combination.

**Entity:** `backend/src/entities/cover-rate.entity.ts`

| Column | SQL type | TS type | Notes |
|--------|----------|---------|-------|
| `id` | `uuid` PK | `string` | |
| `cover_style_id` | `uuid` | `string` | FK → `cover_styles.id` |
| `cover_finish_id` | `uuid` | `string` | FK → `cover_finishes.id` |
| `base_price` | `decimal(8,2)` | `number` | Flat cover cost in USD |
| `created_at` | `timestamp` | `Date` | |
| `deleted_at` | `timestamp` nullable | `Date \| null` | |

**Seeded records (9 rows):**

| Cover Style | Cover Finish | Base Price |
|-------------|--------------|------------|
| Softcover | Gloss | $3.50 |
| Softcover | Matte | $4.00 |
| Softcover | Textured | $4.75 |
| Hardcover | Gloss | $8.00 |
| Hardcover | Matte | $8.50 |
| Hardcover | Textured | $9.25 |
| Dust Jacket | Gloss | $10.00 |
| Dust Jacket | Matte | $10.50 |
| Dust Jacket | Textured | $11.25 |

---

### binding_rates

Binding surcharge per binding type.

**Entity:** `backend/src/entities/binding-rate.entity.ts`

| Column | SQL type | TS type | Notes |
|--------|----------|---------|-------|
| `id` | `uuid` PK | `string` | |
| `binding_type_id` | `uuid` | `string` | FK → `binding_types.id` |
| `surcharge` | `decimal(8,2)` | `number` | Binding cost in USD |
| `created_at` | `timestamp` | `Date` | |
| `deleted_at` | `timestamp` nullable | `Date \| null` | |

**Seeded records (3 rows):**

| Binding Type | Surcharge |
|--------------|-----------|
| Perfect Bind | $1.50 |
| Saddle Stitch | $0.75 |
| Spiral | $2.00 |

---

## Seeding

Run the full seed script after creating the database. It is safe to run multiple times — existing records are found via `findOne` and skipped; only missing records are created.

```bash
cd backend
npx ts-node src/database/seeds/seed.ts
```

**What the seed creates:**
1. All 5 trim sizes (status: active)
2. All 3 cover styles (status: active)
3. All 3 cover finishes (status: active)
4. All 2 print types (status: active)
5. All 3 paper stocks (status: active)
6. All 3 binding types (status: active)
7. 6 page rates
8. 9 cover rates
9. 3 binding rates
10. Admin user: `admin@onpress.com` / `Admin123!` (role: admin) — only created if not already present

**Total:** 5+3+3+2+3+3 = 19 product records + 18 rate rows + 1 admin user = **38 rows** across 10 tables (not counting quotes, coupons, or coupon_usages which start empty).

---

## Entity Relationships

```
users ──────────────────────────────────── quotes (user_id FK nullable, RESTRICT)
users ──────────────────────────────────── coupons (applicable_user_id FK nullable, RESTRICT)
users ──────────────────────────────────── coupon_usages (user_id FK, RESTRICT)

trim_sizes ─────────────────────────────── quotes (trim_size_id FK NOT NULL, RESTRICT)
cover_styles ───────────────────────────── quotes (cover_style_id FK NOT NULL, RESTRICT)
cover_finishes ─────────────────────────── quotes (cover_finish_id FK NOT NULL, RESTRICT)
print_types ────────────────────────────── quotes (print_type_id FK NOT NULL, RESTRICT)
paper_stocks ───────────────────────────── quotes (paper_stock_id FK NOT NULL, RESTRICT)
binding_types ──────────────────────────── quotes (binding_type_id FK NOT NULL, RESTRICT)

print_types ──┐
              ├── page_rates (RESTRICT)
paper_stocks ─┘

cover_styles ──┐
               ├── cover_rates (RESTRICT)
cover_finishes ┘

binding_types ─── binding_rates (RESTRICT)

coupons ────────────────────────────────── coupon_usages (coupon_id FK, RESTRICT)
quotes ─────────────────────────────────── coupon_usages (quote_id FK nullable, RESTRICT)
```

All ManyToOne relations use `onDelete: 'RESTRICT'` — PostgreSQL will block deletion of any record that is still referenced by another table. The 6 product FK columns on `quotes` are NOT NULL, meaning every saved quote must reference a valid product option for all 6 attributes.

---

## Schema Synchronization

In **development** (`NODE_ENV=development`), TypeORM's `synchronize: true` auto-applies schema changes on every restart. No migrations needed locally.

In **production**, set `synchronize: false` and use TypeORM migrations (`npm run migration:generate`, `npm run migration:run`).
