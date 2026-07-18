# API Reference — Book Printing Quoter

Base URL (local): `http://localhost:3001`

All endpoints are prefixed with `/api`.

---

## Products

Endpoints that serve the product catalogue consumed by the quoter wizard (Phase 1).

### GET /api/products/trim-sizes

Returns all available trim size options.

**Response:** `TrimSize[]`
```json
[
  {
    "id": 1,
    "name": "Digest 5.5×8.5",
    "width": "5.50",
    "height": "8.50",
    "minPages": 24,
    "maxPages": 840,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### GET /api/products/cover-styles

Returns all available cover style options.

**Response:** `CoverStyle[]`
```json
[{ "id": 1, "name": "Softcover", "createdAt": "..." }]
```

---

### GET /api/products/cover-finishes

Returns all available cover finish options.

**Response:** `CoverFinish[]`
```json
[{ "id": 1, "name": "Gloss", "createdAt": "..." }]
```

---

### GET /api/products/print-types

Returns all available print type options.

**Response:** `PrintType[]`
```json
[{ "id": 1, "name": "Black & White", "createdAt": "..." }]
```

---

### GET /api/products/paper-stocks

Returns all available paper stock options.

**Response:** `PaperStock[]`
```json
[{ "id": 1, "name": "60lb Natural", "weight": "60lb", "createdAt": "..." }]
```

---

### GET /api/products/binding-types

Returns all available binding type options.

**Response:** `BindingType[]`
```json
[{ "id": 1, "name": "Perfect Bind", "createdAt": "..." }]
```

---

## Auth (Phase 3 — Authentication)

Endpoints for user registration, login, profile management, and password reset. Added in Phase 3.

### POST /api/auth/register

Registers a new user account.

**Request body:**

| Field | Type | Constraints |
|-------|------|-------------|
| `name` | `string` | Non-empty |
| `email` | `string` | Valid email format |
| `password` | `string` | Non-empty |

**Response:** `{ accessToken, user }`
```json
{
  "accessToken": "<JWT>",
  "user": {
    "id": 1,
    "name": "Jane Smith",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

**Errors:**
- `400 Bad Request` — validation failure (missing/invalid fields).
- `409 Conflict` — email already registered.

---

### POST /api/auth/login

Authenticates an existing user and returns a JWT.

**Request body:**

| Field | Type | Constraints |
|-------|------|-------------|
| `email` | `string` | Valid email format |
| `password` | `string` | Non-empty |

**Response:** `{ accessToken, user }`
```json
{
  "accessToken": "<JWT>",
  "user": {
    "id": 1,
    "name": "Jane Smith",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

**Errors:**
- `400 Bad Request` — validation failure.
- `401 Unauthorized` — invalid credentials.

---

### GET /api/auth/me

Returns the authenticated user's profile (passwordHash excluded).

**Auth:** Bearer JWT required (`Authorization: Bearer <token>`).

**Response:** `User`
```json
{
  "id": 1,
  "name": "Jane Smith",
  "email": "user@example.com",
  "role": "customer",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**Errors:**
- `401 Unauthorized` — missing or invalid token.

---

### PATCH /api/auth/profile

Updates the authenticated user's display name.

**Auth:** Bearer JWT required.

**Request body:**

| Field | Type | Constraints |
|-------|------|-------------|
| `name` | `string` | Non-empty |

**Response:** `{ id, name, email, role }`

**Errors:**
- `401 Unauthorized` — missing or invalid token.
- `400 Bad Request` — validation failure.

---

### PATCH /api/auth/password

Changes the authenticated user's password.

**Auth:** Bearer JWT required.

**Request body:**

| Field | Type | Constraints |
|-------|------|-------------|
| `currentPassword` | `string` | Must match current bcrypt hash |
| `newPassword` | `string` | Non-empty |

**Response:** `{ message: string }`

**Errors:**
- `401 Unauthorized` — missing/invalid token or wrong `currentPassword`.
- `400 Bad Request` — validation failure.

---

### POST /api/auth/forgot-password

Initiates the password reset flow. When `EMAIL_CONFIGURED=true` an OTP is sent to the user's email and must be provided on reset.

**Request body:**

| Field | Type |
|-------|------|
| `email` | `string` |

**Response:** `{ otpRequired: boolean }`

- `otpRequired: true` — OTP was emailed; include it in `POST /reset-password`.
- `otpRequired: false` — email not configured; skip OTP on reset.

**Errors:**
- `404 Not Found` — email not registered.

---

### POST /api/auth/reset-password

Completes the password reset. OTP field required only when `EMAIL_CONFIGURED=true`.

**Request body:**

| Field | Type | Constraints |
|-------|------|-------------|
| `email` | `string` | Valid email |
| `newPassword` | `string` | Non-empty |
| `otp` | `string` | Required when `EMAIL_CONFIGURED=true` |

**Response:** `{ message: string }`

**Errors:**
- `400 Bad Request` — invalid/expired OTP, or validation failure.
- `404 Not Found` — email not registered.

---

## Quoter (Phase 2 — Pricing Engine)

Endpoints that calculate and persist quotes. Added in Phase 2. `POST /api/quoter/quote` and `GET /api/quoter/quotes` require authentication (Phase 3).

### POST /api/quoter/calculate-price

Calculates a full price breakdown for the given wizard configuration **without saving** anything to the database. Used by the frontend for live price previews.

**Request body:** `CalculateQuoteDto`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `trimSizeId` | `number` | positive integer | ID of selected trim size |
| `coverStyleId` | `number` | positive integer | ID of selected cover style |
| `coverFinishId` | `number` | positive integer | ID of selected cover finish |
| `printTypeId` | `number` | positive integer | ID of selected print type |
| `paperStockId` | `number` | positive integer | ID of selected paper stock |
| `bindingTypeId` | `number` | positive integer | ID of selected binding type |
| `pageCount` | `number` | 24–840 | Number of pages in the book |
| `quantity` | `number` | min 1 | Print run quantity |

**Response:** `{ totalPrice, priceBreakdown }`
```json
{
  "totalPrice": 20.52,
  "priceBreakdown": {
    "pageCost": 14.00,
    "coverCost": 3.50,
    "bindingCost": 1.50,
    "subtotal": 19.00,
    "tax": 1.52,
    "total": 20.52
  }
}
```

**Pricing formula:**
```
pageCost    = ratePerPage × pageCount
coverCost   = coverRate.basePrice
bindingCost = bindingRate.surcharge
subtotal    = (pageCost + coverCost + bindingCost) × quantity
tax         = subtotal × 0.08
total       = subtotal + tax
```

**Errors:**
- `404 Not Found` — if no rate record exists for the given `printTypeId`+`paperStockId`, `coverStyleId`+`coverFinishId`, or `bindingTypeId` combination.
- `400 Bad Request` — if any field fails DTO validation.

---

### POST /api/quoter/quote

Calculates the price and **saves the quote** to the database. Returns the full persisted `Quote` entity. The quote is associated with the authenticated user.

**Auth:** Bearer JWT required (`Authorization: Bearer <token>`).

**Request body:** Same `CalculateQuoteDto` as `/calculate-price` (8 fields, same constraints).

**Response:** `Quote`
```json
{
  "id": 42,
  "config": {
    "trimSizeId": 1,
    "coverStyleId": 1,
    "coverFinishId": 1,
    "printTypeId": 1,
    "paperStockId": 1,
    "bindingTypeId": 1
  },
  "pageCount": 200,
  "quantity": 100,
  "totalPrice": "2052.00",
  "priceBreakdown": {
    "pageCost": 14.00,
    "coverCost": 3.50,
    "bindingCost": 1.50,
    "subtotal": 19.00,
    "tax": 1.52,
    "total": 20.52
  },
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**Errors:**
- `401 Unauthorized` — missing or invalid JWT.
- `404 Not Found` — same rate-lookup errors as `/calculate`.
- `400 Bad Request` — DTO validation failures.

---

### GET /api/quoter/quotes

Returns all quotes saved by the authenticated user, ordered by `createdAt` descending (most recent first). Added in Phase 3.

**Auth:** Bearer JWT required (`Authorization: Bearer <token>`).

**Response:** `Quote[]`
```json
[
  {
    "id": 42,
    "config": {
      "trimSizeId": 1,
      "coverStyleId": 1,
      "coverFinishId": 1,
      "printTypeId": 1,
      "paperStockId": 1,
      "bindingTypeId": 1
    },
    "pageCount": 200,
    "quantity": 100,
    "totalPrice": "2052.00",
    "priceBreakdown": {
      "pageCost": 14.00,
      "coverCost": 3.50,
      "bindingCost": 1.50,
      "subtotal": 19.00,
      "tax": 1.52,
      "total": 20.52
    },
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

**Errors:**
- `401 Unauthorized` — missing or invalid JWT.
