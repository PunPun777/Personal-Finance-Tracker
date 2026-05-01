# 🗄 Database Schema

## 👤 User — ✅ Implemented

- \_id
- name
- email (unique, indexed)
- password (bcrypt hashed)
- createdAt
- updatedAt

## 💰 Transaction — ✅ Implemented

- \_id
- userId (ref: User, indexed)
- amount (min: 0.01)
- category (enum: 15 standardized categories)
- description (optional, max 300 chars)
- type (enum: "income" | "expense")
- date (default: now)
- goalId (ref: Goal, optional, indexed) — links transaction to a savings goal
- accountId (ref: Account, optional, indexed) — links transaction to an account for balance tracking
- createdAt
- updatedAt

### Indexes

- `{ userId: 1, date: -1 }` — user timeline queries
- `{ userId: 1, category: 1 }` — category filtering
- `{ userId: 1, goalId: 1 }` — goal contribution aggregation
- `{ userId: 1, accountId: 1 }` — account balance queries

## 🏦 Account — ✅ Implemented

- \_id
- userId (ref: User, indexed)
- name (2–50 chars, unique per user)
- type (enum: Wallet / Bank / Credit Card / Savings / Investment / Other)
- balance (min: 0 — cannot be negative)
- currency (3-char code, default: "INR")
- isActive (boolean, default: true)
- createdAt
- updatedAt

### Indexes

- `{ userId: 1, name: 1 }` — unique compound (one account name per user)

### Transaction Integration

When a transaction is created, updated, or deleted with an `accountId`, the linked account's balance is atomically adjusted using MongoDB sessions and `$inc` operations. Income increases the balance; expense decreases it. Expenses that would push the balance below 0 are rejected with a 400 error.

## 🎯 Budget — ✅ Implemented

- \_id
- userId (ref: User, indexed)
- category (enum: BUDGET_CATEGORIES — includes "Overall Monthly" + all transaction categories)
- limit (min: 0.01)
- categoryBudgets (optional array of `{ category, limit }` — for sub-breakdowns)
- createdAt
- updatedAt

### Indexes

- `{ userId: 1, category: 1 }` — unique compound (one budget per user per category)

### Design Note

Budgets are **persistent per category**, not per month. A "Food & Dining" budget of ₹5,000 applies every month. Current-month spend is computed dynamically from transactions on the frontend via `computeBudgetStats`.

## 🎯 Goal — ✅ Implemented

- \_id
- userId (ref: User, indexed)
- title (min 2, max 100 chars)
- targetAmount (min: 1)
- savedAmount (stored as default 0, but **overridden at read time** by aggregation)
- targetDate (required)
- monthlyContribution (optional)
- status (enum: "active" | "completed" | "paused", default: "active")
- createdAt
- updatedAt

### Virtual Fields

- `progressPercent` — `(savedAmount / targetAmount) * 100`, capped at 100
- `remainingAmount` — `max(targetAmount - savedAmount, 0)`
- `feasibilityStatus` — "on_track" | "at_risk" | "not_achievable" | "completed" | "unknown"

### Key Architecture Decision

`savedAmount` is **not manually entered** by the user. It is computed at read time by aggregating all `expense` transactions where `goalId` matches the goal's `_id`. This eliminates data drift and ensures real-time accuracy.

## ⚠️ Notes

- Categories are standardized across Transaction, Budget, and Goal modules
- Raw descriptions are preserved for future ML training data
- Goals are linked to user savings behavior via the `goalId` field on transactions
- All schemas use `toJSON` transforms to strip `__v` from API responses
