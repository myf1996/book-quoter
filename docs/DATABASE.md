# Database Reference — Book Printing Quoter

**DBMS:** PostgreSQL 16
**ORM:** TypeORM (type-safe repositories, no raw SQL)
**Database name (local):** `quoter_db`

---

## Entity Base Class

All 11 entities extend **`BaseAppEntity`** (abstract TypeORM class in `backend/src/entities/`), which provides:

| Column | SQL type | Notes |
|--------|----------|-------|
| `created_at` | `timestamp` | Auto-set on insert |
| `deleted_at` | `timestamp` nullable | Soft-delete (`@DeleteDateColumn`) |

`SnakeNamingStrategy` from `typeorm-naming-strategies` is applied globally — all camelCase TS properties map to `snake_case` columns automatically.

---

## Phase 3 Tables — Authentication

### users

Stores registered user accounts. Added in Phase 3.

| Column | SQL type | TS type | Notes |
|--------|----------|---------|-------|
| `id` | `serial` PK | `number` | Auto-increment |
| `name` | `varchar(255)` NOT NULL | `string` | Display name |
| `email` | `varchar(255)` UNIQUE NOT NULL | `string` | Login identifier |
| `password_hash` | `varchar(255)` NOT NULL | `string` | bcrypt hash — never returned by the API |
| `role` | `enum('admin','customer')` | `UserRole` | Default `customer`; included in JWT payload |
| `created_at` | `timestamp` | `Date` | Via `BaseAppEntity` |
| `deleted_at` | `timestamp` nullable | `Date \| null` | Soft-delete via `BaseAppEntity` |

Entity: `backend/src/entities/user.entity.ts`

---

## Phase 1 Tables — Product Catalogue

These tables store the option sets that populate each wizard step.

### trim_sizes

| Column | SQL type | TS type | Notes |
|--------|----------|---------|-------|
| `id` | `serial` PK | `number` | Auto-increment |
| `name` | `varchar(100)` UNIQUE | `string` | e.g. "Digest 5.5×8.5" |
| `width` | `decimal(5,2)` | `number` | Inches |
| `height` | `decimal(5,2)` | `number` | Inches |
| `min_pages` | `integer` | `number` | Default 24 |
| `max_pages` | `integer` | `number` | Default 840 |
| `created_at` | `timestamp` | `Date` | Via `BaseAppEntity` |
| `deleted_at` | `timestamp` nullable | `Date \| null` | Soft-delete via `BaseAppEntity` |

Entity: `backend/src/entities/trim-size.entity.ts`

---

### cover_styles

| Column | SQL type | TS type | Notes |
|--------|----------|---------|-------|
| `id` | `serial` PK | `number` | |
| `name` | `varchar(100)` UNIQUE | `string` | e.g. "Softcover", "Hardcover" |
| `created_at` | `timestamp` | `Date` | Via `BaseAppEntity` |
| `deleted_at` | `timestamp` nullable | `Date \| null` | Soft-delete via `BaseAppEntity` |

Entity: `backend/src/entities/cover-style.entity.ts`

---

### cover_finishes

| Column | SQL type | TS type | Notes |
|--------|----------|---------|-------|
| `id` | `serial` PK | `number` | |
| `name` | `varchar(100)` UNIQUE | `string` | e.g. "Gloss", "Matte" |
| `created_at` | `timestamp` | `Date` | Via `BaseAppEntity` |
| `deleted_at` | `timestamp` nullable | `Date \| null` | Soft-delete via `BaseAppEntity` |

Entity: `backend/src/entities/cover-finish.entity.ts`

---

### print_types

| Column | SQL type | TS type | Notes |
|--------|----------|---------|-------|
| `id` | `serial` PK | `number` | |
| `name` | `varchar(100)` UNIQUE | `string` | e.g. "Black & White", "Color" |
| `created_at` | `timestamp` | `Date` | Via `BaseAppEntity` |
| `deleted_at` | `timestamp` nullable | `Date \| null` | Soft-delete via `BaseAppEntity` |

Entity: `backend/src/entities/print-type.entity.ts`

---

### paper_stocks

| Column | SQL type | TS type | Notes |
|--------|----------|---------|-------|
| `id` | `serial` PK | `number` | |
| `name` | `varchar(100)` UNIQUE | `string` | e.g. "60lb Natural" |
| `weight` | `varchar(50)` nullable | `string` | e.g. "60lb" |
| `created_at` | `timestamp` | `Date` | Via `BaseAppEntity` |
| `deleted_at` | `timestamp` nullable | `Date \| null` | Soft-delete via `BaseAppEntity` |

Entity: `backend/src/entities/paper-stock.entity.ts`

---

### binding_types

| Column | SQL type | TS type | Notes |
|--------|----------|---------|-------|
| `id` | `serial` PK | `number` | |
| `name` | `varchar(100)` UNIQUE | `string` | e.g. "Perfect Bind", "Saddle Stitch" |
| `created_at` | `timestamp` | `Date` | Via `BaseAppEntity` |
| `deleted_at` | `timestamp` nullable | `Date \| null` | Soft-delete via `BaseAppEntity` |

Entity: `backend/src/entities/binding-type.entity.ts`

---

## Phase 1 Tables — Quotes

### quotes

Stores completed quote configurations and their calculated prices. Extended in Phase 2 to include pricing columns. Extended in Phase 3 to associate quotes with a user.

| Column | SQL type | TS type | Notes |
|--------|----------|---------|-------|
| `id` | `serial` PK | `number` | Auto-increment |
| `config` | `jsonb` | `QuoteConfig` | All six wizard option IDs (trimSizeId, coverStyleId, coverFinishId, printTypeId, paperStockId, bindingTypeId) |
| `page_count` | `integer` | `number` | Added in Phase 2 |
| `quantity` | `integer` | `number` | Added in Phase 2 |
| `total_price` | `decimal(10,2)` | `number` | Added in Phase 2 |
| `price_breakdown` | `jsonb` | `PriceBreakdown` | Added in Phase 2; full line-item breakdown |
| `user_id` | `integer` nullable | `number \| null` | Added in Phase 3; FK to `users.id` — null for anonymous quotes saved before auth existed |
| `created_at` | `timestamp` | `Date` | Via `BaseAppEntity` |
| `deleted_at` | `timestamp` nullable | `Date \| null` | Soft-delete via `BaseAppEntity` |

`PriceBreakdown` shape: `{ pageCost, coverCost, bindingCost, subtotal, tax, total }` (all `number`, USD).

Entity: `backend/src/entities/quote.entity.ts`

---

## Phase 2 Tables — Pricing Rates

Three new rate tables added in Phase 2 to power the pricing engine. Seeded via `backend/src/database/seeds/pricing-seed.ts`.

### page_rates

Stores the per-page printing cost for each `printType` + `paperStock` combination.

| Column | SQL type | TS type | Notes |
|--------|----------|---------|-------|
| `id` | `serial` PK | `number` | |
| `print_type_id` | `integer` | `number` | FK reference (logical) to `print_types.id` |
| `paper_stock_id` | `integer` | `number` | FK reference (logical) to `paper_stocks.id` |
| `rate_per_page` | `decimal(8,4)` | `number` | Cost per page in USD |
| `created_at` | `timestamp` | `Date` | Via `BaseAppEntity` |
| `deleted_at` | `timestamp` nullable | `Date \| null` | Soft-delete via `BaseAppEntity` |

Unique constraint: `(print_type_id, paper_stock_id)`.

Seeded values (6 rows):

| print_type_id | paper_stock_id | rate_per_page |
|---------------|----------------|---------------|
| 1 (B&W) | 1 (60lb Natural) | $0.0350 |
| 1 (B&W) | 2 (70lb White) | $0.0400 |
| 1 (B&W) | 3 (80lb White) | $0.0450 |
| 2 (Color) | 1 (60lb Natural) | $0.0850 |
| 2 (Color) | 2 (70lb White) | $0.0950 |
| 2 (Color) | 3 (80lb White) | $0.1050 |

Entity: `backend/src/entities/page-rate.entity.ts`

---

### cover_rates

Stores the flat cover cost for each `coverStyle` + `coverFinish` combination.

| Column | SQL type | TS type | Notes |
|--------|----------|---------|-------|
| `id` | `serial` PK | `number` | |
| `cover_style_id` | `integer` | `number` | FK reference (logical) to `cover_styles.id` |
| `cover_finish_id` | `integer` | `number` | FK reference (logical) to `cover_finishes.id` |
| `rate_per_cover` | `decimal(8,2)` | `number` | Flat cover cost in USD |
| `created_at` | `timestamp` | `Date` | Via `BaseAppEntity` |
| `deleted_at` | `timestamp` nullable | `Date \| null` | Soft-delete via `BaseAppEntity` |

Unique constraint: `(cover_style_id, cover_finish_id)`.

Seeded values (9 rows):

| cover_style_id | cover_finish_id | rate_per_cover |
|----------------|-----------------|----------------|
| 1 (Softcover) | 1 (Gloss) | $3.50 |
| 1 (Softcover) | 2 (Matte) | $4.00 |
| 1 (Softcover) | 3 (Textured) | $4.75 |
| 2 (Hardcover) | 1 (Gloss) | $8.00 |
| 2 (Hardcover) | 2 (Matte) | $8.50 |
| 2 (Hardcover) | 3 (Textured) | $9.25 |
| 3 (Dust Jacket) | 1 (Gloss) | $10.00 |
| 3 (Dust Jacket) | 2 (Matte) | $10.50 |
| 3 (Dust Jacket) | 3 (Textured) | $11.25 |

Entity: `backend/src/entities/cover-rate.entity.ts`

---

### binding_rates

Stores the binding cost for each binding type.

| Column | SQL type | TS type | Notes |
|--------|----------|---------|-------|
| `id` | `serial` PK | `number` | |
| `binding_type_id` | `integer` | `number` | FK reference (logical) to `binding_types.id` |
| `rate_per_bind` | `decimal(8,2)` | `number` | Binding cost in USD |
| `created_at` | `timestamp` | `Date` | Via `BaseAppEntity` |
| `deleted_at` | `timestamp` nullable | `Date \| null` | Soft-delete via `BaseAppEntity` |

Unique constraint: `(binding_type_id)`.

Seeded values (3 rows):

| binding_type_id | rate_per_bind |
|-----------------|---------------|
| 1 (Perfect Bind) | $1.50 |
| 2 (Saddle Stitch) | $0.75 |
| 3 (Spiral) | $2.00 |

Entity: `backend/src/entities/binding-rate.entity.ts`

---

## Seeding

Run the Phase 2 pricing seed after initial migration:

```bash
cd backend
npx ts-node src/database/seeds/pricing-seed.ts
```

This inserts 6 page rates, 9 cover rates, and 3 binding rates. The seed uses `save()` (upsert-safe via TypeORM) and will not duplicate rows if run again because of the unique constraints.
