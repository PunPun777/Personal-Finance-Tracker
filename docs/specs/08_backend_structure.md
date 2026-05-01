# ⚙ Backend Structure

```
/server/src
  /controllers       → authController, transactionController, goalController, budgetController
  /models            → User, Transaction, Goal, Budget
  /routes            → authRoutes, transactionRoutes, goalRoutes, budgetRoutes
  /services          → authService, transactionService, goalService, budgetService
  /validators        → authValidators, transactionValidators, goalValidators, budgetValidators
  /middleware         → authMiddleware, errorHandler, validationMiddleware
  /config            → db.js (MongoDB connection)
  /utils             → ApiError.js, apiResponse.js, jwtUtils.js
  app.js             → Express app setup (middleware, routes, error handling)
  server.js          → Server entry point
```

## Layers — ✅ Implemented

```
Routes → Validators → Controllers → Services → Models → MongoDB
```

All four modules (Auth, Transaction, Goal, Budget) strictly follow this pattern.

## Middleware — ✅ Implemented

- **authMiddleware** — JWT verification, attaches `req.user`
- **errorHandler** — Centralized error handler (Mongoose errors, API errors, unknown errors)
- **validationMiddleware** — Runs express-validator checks, returns 400 with error array

## Validators — ✅ Implemented

- `authValidators.js` — register/login field validation
- `transactionValidators.js` — create/update rules + optional goalId validation
- `goalValidators.js` — create/update rules (no savedAmount — it's computed)
- `budgetValidators.js` — create/update rules with category enum validation

## Utilities — ✅ Implemented

- `ApiError` — Custom error class with HTTP status codes
- `sendSuccess` / `sendError` — Consistent response envelope helpers
- `generateToken` — JWT generation utility

## Best Practices — ✅ Followed

- Input validation on every mutating endpoint
- User-scoped data isolation (all queries filter by `req.user._id`)
- Compound indexes for query performance
- Lean queries where virtuals are not needed
- No business logic in controllers (delegated to services)
