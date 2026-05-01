# 🔌 API Contracts

## Auth — ✅ Implemented

```
POST /api/auth/register
POST /api/auth/login
```

## Transactions — ✅ Implemented

```
GET    /api/transactions              — list (paginated, filterable)
GET    /api/transactions/summary      — income/expense/balance totals
POST   /api/transactions              — create
PUT    /api/transactions/:id          — update
DELETE /api/transactions/:id          — delete
```

### Query Parameters (GET /api/transactions)

- `category` — filter by category
- `type` — "income" or "expense"
- `startDate`, `endDate` — date range
- `search` — description text search
- `page`, `limit` — pagination (max 100)
- `sortBy` — "date", "amount", "category", "createdAt"
- `order` — "asc" or "desc"

## Budgets — ✅ Implemented

```
GET    /api/budgets                   — list user's budgets
POST   /api/budgets                   — create (409 if duplicate category)
PUT    /api/budgets/:id               — update
DELETE /api/budgets/:id               — delete
```

## Goals — ✅ Implemented

```
GET    /api/goals                     — list user's goals (with computed savedAmount)
GET    /api/goals/:id                 — get single goal (with computed savedAmount)
POST   /api/goals                     — create
PUT    /api/goals/:id                 — update (savedAmount is read-only)
DELETE /api/goals/:id                 — delete
```

## Accounts — ✅ Implemented

```
GET    /api/accounts                  — list user's accounts
GET    /api/accounts/:id              — get single account
POST   /api/accounts                  — create (409 if duplicate name)
PUT    /api/accounts/:id              — update (409 on rename conflict)
DELETE /api/accounts/:id              — delete
```

> **Note:** Account balances are updated atomically when transactions are created, updated, or deleted via MongoDB sessions.

## Subscriptions — ✅ Implemented

```
GET    /api/subscriptions             — list user's subscriptions
POST   /api/subscriptions             — create (409 if duplicate name)
PUT    /api/subscriptions/:id         — update
DELETE /api/subscriptions/:id         — delete
POST   /api/subscriptions/process-due — trigger manual processing of due subscriptions
```

## Health Check — ✅ Implemented

```
GET    /api/health                    — server status + timestamp
```

---

## Response Format

All API responses follow a consistent envelope:

```json
{
  "success": true,
  "message": "Description of result",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "errors": []
}
```

`errors` array is present for validation failures (from express-validator).

---

## Authentication

All endpoints except `/api/auth/*` and `/api/health` require a valid JWT in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Rate Limiting

All `/api/*` endpoints are rate-limited to **100 requests per 15 minutes** per IP.
