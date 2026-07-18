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

## Quoter (Phase 2 — Pricing Engine)

Endpoints that calculate and persist quotes. Added in Phase 2.

### POST /api/quoter/calculate

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

**Response:** `PriceBreakdown`
```json
{
  "pageCost": 14.00,
  "coverCost": 3.50,
  "bindingCost": 1.50,
  "subtotal": 19.00,
  "tax": 1.52,
  "total": 20.52
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

Calculates the price and **saves the quote** to the database. Returns the full persisted `Quote` entity.

**Request body:** Same `CalculateQuoteDto` as `/calculate` (8 fields, same constraints).

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
- `404 Not Found` — same rate-lookup errors as `/calculate`.
- `400 Bad Request` — DTO validation failures.
