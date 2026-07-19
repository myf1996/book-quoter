# API Reference — Book Printing Quoter

**Base URL (local):** `http://localhost:3001`  
All endpoints are prefixed with `/api`.

**Authentication:** Protected endpoints require a Bearer JWT in the `Authorization` header:
```
Authorization: Bearer <token>
```
Tokens are issued by `POST /api/auth/login` and `POST /api/auth/register`. They expire after 7 days.

**Pagination:** Paginated endpoints return a `PaginatedResponse<T>` object:
```json
{
  "data": [...],
  "total": 45,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```
Default: `page=1`, `limit=20`.

**IDs:** All primary keys are UUIDs (e.g. `"a3f2c1d0-..."`), not integers.

---

## Products — Public Catalogue

These endpoints serve the 6 product option types shown in the customer wizard. They require **no authentication** and return **only active records** (`status = 'active'`).

### GET /api/products/trim-sizes

Returns all active trim size options.

**Response:** `TrimSize[]`
```json
[
  {
    "id": "a3f2c1d0-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
    "name": "Digest 5.5×8.5",
    "width": "5.50",
    "height": "8.50",
    "minPages": 24,
    "maxPages": 840,
    "status": "active",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
]
```

---

### GET /api/products/cover-styles

Returns all active cover style options.

**Response:** `CoverStyle[]`
```json
[
  { "id": "...", "name": "Softcover", "status": "active", "createdAt": "..." },
  { "id": "...", "name": "Hardcover", "status": "active", "createdAt": "..." },
  { "id": "...", "name": "Dust Jacket", "status": "active", "createdAt": "..." }
]
```

---

### GET /api/products/cover-finishes

Returns all active cover finish options.

**Response:** `CoverFinish[]`
```json
[
  { "id": "...", "name": "Gloss", "status": "active", "createdAt": "..." },
  { "id": "...", "name": "Matte", "status": "active", "createdAt": "..." },
  { "id": "...", "name": "Textured", "status": "active", "createdAt": "..." }
]
```

---

### GET /api/products/print-types

Returns all active print type options.

**Response:** `PrintType[]`
```json
[
  { "id": "...", "name": "Black & White", "status": "active", "createdAt": "..." },
  { "id": "...", "name": "Color", "status": "active", "createdAt": "..." }
]
```

---

### GET /api/products/paper-stocks

Returns all active paper stock options.

**Response:** `PaperStock[]`
```json
[
  { "id": "...", "name": "60lb Natural", "weight": "60lb", "status": "active", "createdAt": "..." },
  { "id": "...", "name": "70lb White", "weight": "70lb", "status": "active", "createdAt": "..." },
  { "id": "...", "name": "80lb White", "weight": "80lb", "status": "active", "createdAt": "..." }
]
```

---

### GET /api/products/binding-types

Returns all active binding type options.

**Response:** `BindingType[]`
```json
[
  { "id": "...", "name": "Perfect Bind", "status": "active", "createdAt": "..." },
  { "id": "...", "name": "Saddle Stitch", "status": "active", "createdAt": "..." },
  { "id": "...", "name": "Spiral", "status": "active", "createdAt": "..." }
]
```

---

## Auth — Authentication & Profiles

### POST /api/auth/register

Registers a new user account and returns a JWT.

**Request body:**

| Field | Type | Constraints |
|-------|------|-------------|
| `name` | `string` | Required, min 2 characters |
| `email` | `string` | Valid email format |
| `password` | `string` | Required, min 8 characters |

**Response:** `{ accessToken, user }`
```json
{
  "accessToken": "<JWT>",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "customer"
  }
}
```

**Errors:**
- `400 Bad Request` — validation failure (missing/invalid fields)
- `409 Conflict` — email already registered

---

### POST /api/auth/login

Authenticates an existing user and returns a JWT.

**Request body:**

| Field | Type | Constraints |
|-------|------|-------------|
| `email` | `string` | Valid email format |
| `password` | `string` | Required |

**Response:** `{ accessToken, user }` — same shape as `/register`.

**Errors:**
- `400 Bad Request` — validation failure
- `401 Unauthorized` — invalid credentials

---

### GET /api/auth/me

Returns the authenticated user's profile. The `passwordHash` field is never included in any response.

**Auth:** Bearer JWT required.

**Response:** `User`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "customer",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

**Errors:**
- `401 Unauthorized` — missing or invalid token
- `404 Not Found` — user no longer exists

---

### PATCH /api/auth/profile

Updates the authenticated user's display name.

**Auth:** Bearer JWT required.

**Request body:**

| Field | Type | Constraints |
|-------|------|-------------|
| `name` | `string` | Required, min 2 characters |

**Response:** `{ id, name, email, role }`

**Errors:**
- `401 Unauthorized` — missing or invalid token
- `400 Bad Request` — validation failure

---

### PATCH /api/auth/password

Changes the authenticated user's password.

**Auth:** Bearer JWT required.

**Request body:**

| Field | Type | Constraints |
|-------|------|-------------|
| `currentPassword` | `string` | Must match current bcrypt hash |
| `newPassword` | `string` | Required |

**Response:** `{ message: "Password updated successfully" }`

**Errors:**
- `401 Unauthorized` — missing/invalid token or wrong `currentPassword`
- `400 Bad Request` — validation failure

---

### POST /api/auth/forgot-password

Initiates the password reset flow. When `EMAIL_CONFIGURED=true` a 6-digit OTP is sent to the user's email. When `false`, the reset is OTP-free.

**Request body:**

| Field | Type |
|-------|------|
| `email` | `string` |

**Response:** `{ otpRequired: boolean }`

**Errors:**
- `404 Not Found` — email not registered

---

### POST /api/auth/reset-password

Completes the password reset. Include the `otp` field only when `EMAIL_CONFIGURED=true`.

**Request body:**

| Field | Type | Required when |
|-------|------|--------------|
| `email` | `string` | Always |
| `newPassword` | `string` | Always |
| `otp` | `string` | `EMAIL_CONFIGURED=true` only |

**Response:** `{ message: "Password reset successfully" }`

**Errors:**
- `400 Bad Request` — invalid/expired OTP or validation failure
- `404 Not Found` — email not registered

---

## Quoter — Price Calculation & Quote Management

### POST /api/quoter/calculate-price

Calculates a full price breakdown **without saving** anything to the database. Used by the frontend for the live price preview sidebar.

**Auth:** None required.

**Request body:** `CalculateQuoteDto`

| Field | Type | Constraints |
|-------|------|-------------|
| `trimSizeId` | `string` (UUID) | Valid UUID |
| `coverStyleId` | `string` (UUID) | Valid UUID |
| `coverFinishId` | `string` (UUID) | Valid UUID |
| `printTypeId` | `string` (UUID) | Valid UUID |
| `paperStockId` | `string` (UUID) | Valid UUID |
| `bindingTypeId` | `string` (UUID) | Valid UUID |
| `pageCount` | `number` | Min 1, integer |
| `quantity` | `number` | Min 1, integer |

**Response:** `{ pageCost, coverCost, bindingCost, subtotal, tax, total }`
```json
{
  "pageCost": 7.00,
  "coverCost": 3.50,
  "bindingCost": 1.50,
  "subtotal": 1200.00,
  "tax": 96.00,
  "total": 1296.00
}
```

**Pricing formula:**
```
pageCost    = pageRate.ratePerPage × pageCount
coverCost   = coverRate.basePrice
bindingCost = bindingRate.surcharge
subtotal    = (pageCost + coverCost + bindingCost) × quantity
tax         = subtotal × 0.08
total       = subtotal + tax
```

**Errors:**
- `404 Not Found` — no rate record exists for the given ID combination
- `400 Bad Request` — DTO validation failure

---

### POST /api/quoter/quote

Calculates the price **and saves the quote** to the database, associated with the authenticated user.

**Auth:** Bearer JWT required.

**Request body:** Same `CalculateQuoteDto` as `/calculate-price`.

**Response:** Saved `Quote` entity
```json
{
  "id": "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a",
  "config": {
    "trimSizeId": "a3f2c1d0-...",
    "coverStyleId": "...",
    "coverFinishId": "...",
    "printTypeId": "...",
    "paperStockId": "...",
    "bindingTypeId": "..."
  },
  "pageCount": 200,
  "quantity": 100,
  "totalPrice": "1296.00",
  "priceBreakdown": {
    "pageCost": 7.00,
    "coverCost": 3.50,
    "bindingCost": 1.50,
    "subtotal": 1200.00,
    "tax": 96.00,
    "total": 1296.00
  },
  "createdAt": "2026-07-19T00:00:00.000Z"
}
```

**Errors:**
- `401 Unauthorized` — missing or invalid JWT
- `404 Not Found` — rate lookup failure
- `400 Bad Request` — DTO validation failure

---

### GET /api/quoter/quotes

Returns the authenticated user's saved quotes, paginated and ordered newest first.

**Auth:** Bearer JWT required.

**Query params:**

| Param | Type | Default |
|-------|------|---------|
| `page` | `number` | `1` |
| `limit` | `number` | `20` |

**Response:** `PaginatedResponse<Quote>`
```json
{
  "data": [
    {
      "id": "d4e5f6a7-...",
      "config": { "trimSizeId": "...", ... },
      "pageCount": 200,
      "quantity": 100,
      "totalPrice": "1296.00",
      "priceBreakdown": { "pageCost": 7.00, "coverCost": 3.50, "bindingCost": 1.50, "subtotal": 1200.00, "tax": 96.00, "total": 1296.00 },
      "createdAt": "2026-07-19T00:00:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

**Errors:**
- `401 Unauthorized` — missing or invalid JWT

---

## Admin — Management Endpoints

All admin endpoints require:
1. Bearer JWT (`Authorization: Bearer <token>`)
2. The authenticated user must have `role: "admin"`

Returning `403 Forbidden` if the role check fails.

---

### GET /api/admin/dashboard

Returns aggregate stats for the admin dashboard.

**Response:**
```json
{
  "totalUsers": 12,
  "totalQuotes": 47,
  "totalRevenue": 58234.50
}
```

`totalRevenue` is the sum of `total_price` across all non-deleted quotes. Returns `0` when no quotes exist.

---

### Product Option CRUD (6 endpoints, same pattern)

The following 6 product types each expose the same 4 endpoints. Replace `{resource}` with one of:
`trim-sizes` | `cover-styles` | `cover-finishes` | `print-types` | `paper-stocks` | `binding-types`

#### GET /api/admin/{resource}

Returns all records of the given type. Optionally filter by status.

**Query params:**

| Param | Type | Values |
|-------|------|--------|
| `status` | `string` | `active` or `inactive` (omit to return all) |

**Response:** Array of product objects, e.g. for trim-sizes:
```json
[
  {
    "id": "a3f2c1d0-...",
    "name": "Digest 5.5×8.5",
    "width": "5.50",
    "height": "8.50",
    "minPages": 24,
    "maxPages": 840,
    "status": "active",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
]
```
Simpler types (cover-styles, print-types, etc.) omit the dimension/weight fields.

---

#### POST /api/admin/{resource}

Creates a new product option. **New records default to `status: inactive`** and will not appear in the customer wizard until explicitly activated.

**Request body:**

| Field | Type | Notes |
|-------|------|-------|
| `name` | `string` | Required |
| `status` | `string` | Optional; `"active"` or `"inactive"` (default `"inactive"`) |
| `width`, `height` | `number` | trim-sizes only |
| `minPages`, `maxPages` | `number` | trim-sizes only |
| `weight` | `string` | paper-stocks only |

**Response:** Created entity object.

**Errors:**
- `400 Bad Request` — validation failure or duplicate name

---

#### PATCH /api/admin/{resource}/:id

Updates a product option. Supports partial updates — send only the fields you want to change.

**Request body (any combination):**

| Field | Type |
|-------|------|
| `name` | `string` |
| `status` | `"active"` or `"inactive"` |

**Response:** Updated entity object.

**Errors:**
- `404 Not Found` — record does not exist
- `400 Bad Request` — validation failure

---

#### DELETE /api/admin/{resource}/:id

Soft-deletes the record (sets `deleted_at` timestamp). The record no longer appears in any list but is not destroyed from the database.

**Response:** `204 No Content`

**Errors:**
- `404 Not Found` — record does not exist or already deleted

---

### Pricing CRUD

#### GET /api/admin/page-rates

Returns all page rates with full `printType` and `paperStock` relations.

**Response:** `PageRate[]`
```json
[
  {
    "id": "...",
    "printType": { "id": "...", "name": "Black & White" },
    "paperStock": { "id": "...", "name": "60lb Natural" },
    "ratePerPage": 0.035,
    "createdAt": "..."
  }
]
```

---

#### POST /api/admin/page-rates

Creates a new page rate.

**Request body:**

| Field | Type |
|-------|------|
| `printTypeId` | `string` (UUID) |
| `paperStockId` | `string` (UUID) |
| `ratePerPage` | `number` |

**Response:** Created `PageRate` entity.

---

#### PATCH /api/admin/page-rates/:id

Updates a page rate. Send only the fields to change.

**Response:** Updated `PageRate` entity.

**Errors:** `404 Not Found` if rate does not exist.

---

#### DELETE /api/admin/page-rates/:id

Soft-deletes the page rate.

**Response:** `204 No Content`

---

#### GET /api/admin/cover-rates

Returns all cover rates with `coverStyle` and `coverFinish` relations.

**Response:** `CoverRate[]`
```json
[
  {
    "id": "...",
    "coverStyle": { "id": "...", "name": "Softcover" },
    "coverFinish": { "id": "...", "name": "Gloss" },
    "basePrice": 3.50,
    "createdAt": "..."
  }
]
```

---

#### POST /api/admin/cover-rates

**Request body:** `{ coverStyleId, coverFinishId, basePrice }`

---

#### PATCH /api/admin/cover-rates/:id

Partial update. **Response:** Updated entity.

---

#### DELETE /api/admin/cover-rates/:id

Soft delete. **Response:** `204 No Content`

---

#### GET /api/admin/binding-rates

Returns all binding rates with `bindingType` relation.

**Response:** `BindingRate[]`
```json
[
  {
    "id": "...",
    "bindingType": { "id": "...", "name": "Perfect Bind" },
    "surcharge": 1.50,
    "createdAt": "..."
  }
]
```

---

#### POST /api/admin/binding-rates

**Request body:** `{ bindingTypeId, surcharge }`

---

#### PATCH /api/admin/binding-rates/:id

Partial update. **Response:** Updated entity.

---

#### DELETE /api/admin/binding-rates/:id

Soft delete. **Response:** `204 No Content`

---

### User Management

#### GET /api/admin/users

Returns all registered users, paginated and ordered newest first.

**Query params:**

| Param | Type | Default |
|-------|------|---------|
| `page` | `number` | `1` |
| `limit` | `number` | `20` |

**Response:** `PaginatedResponse<UserView>`
```json
{
  "data": [
    {
      "id": "550e8400-...",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "customer",
      "createdAt": "2026-07-01T00:00:00.000Z"
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

Note: `passwordHash` is never included in any user response.

---

#### PATCH /api/admin/users/:id/role

Changes a user's role.

**Request body:**

| Field | Type | Values |
|-------|------|--------|
| `role` | `string` | `"admin"` or `"customer"` |

**Response:** Updated `UserView` (id, name, email, role, createdAt).

**Errors:**
- `404 Not Found` — user does not exist

---

#### DELETE /api/admin/users/:id

Soft-deletes a user account.

**Response:** `204 No Content`

**Errors:**
- `404 Not Found` — user does not exist

---

### Quote Management

#### GET /api/admin/quotes

Returns all quotes in the system, paginated and ordered newest first. Includes the associated user.

**Query params:**

| Param | Type | Default |
|-------|------|---------|
| `page` | `number` | `1` |
| `limit` | `number` | `20` |

**Response:** `PaginatedResponse<Quote>`
```json
{
  "data": [
    {
      "id": "d4e5f6a7-...",
      "config": { "trimSizeId": "...", "coverStyleId": "...", "coverFinishId": "...", "printTypeId": "...", "paperStockId": "...", "bindingTypeId": "..." },
      "pageCount": 200,
      "quantity": 100,
      "totalPrice": "1296.00",
      "priceBreakdown": { "pageCost": 7.00, "coverCost": 3.50, "bindingCost": 1.50, "subtotal": 1200.00, "tax": 96.00, "total": 1296.00 },
      "createdAt": "2026-07-19T00:00:00.000Z",
      "user": {
        "id": "550e8400-...",
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
    }
  ],
  "total": 47,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```
