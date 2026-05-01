# 🖥 Frontend Structure

```
/src
  /components
    /ui              → shadcn/ui primitives (Button, Card, Dialog, etc.)
    /dashboard       → SummaryCard, InsightCard, EmptyChart
    /transactions    → TransactionForm, AmountCell
    /budgeting       → BudgetForm, BudgetCard
    /goals           → GoalForm, GoalCard
    ProtectedRoute.jsx
  /pages             → Dashboard, Transactions, Budgets, Goals, Accounts, Login, Register
  /hooks             → useAuth, useTransactions, useBudgets, useGoals, useDashboard, useTheme
  /services          → apiClient, authService, transactionService, budgetService, goalService, dashboardService
  /utils             → formatINR, computeBudgetStats
  /constants         → transactionCategories, budgetCategories, chartColors
  /context           → AuthProvider, AuthContext, ThemeProvider, ThemeContext
  /layouts           → AppLayout (navbar + page outlet)
  /lib               → cn (class merge utility)
```

---

## 🧭 Navigation Structure — ✅ Implemented

The application uses a **top navbar layout** that persists across all authenticated pages.

### Layout Flow

```
Navbar (Top — sticky, glassmorphism)
  ↓
Page Content (Outlet)
```

---

## 📄 Pages — ✅ Implemented

| Page | Route | Status |
|---|---|---|
| Login | `/login` | ✅ |
| Register | `/register` | ✅ |
| Dashboard | `/` | ✅ |
| Transactions | `/transactions` | ✅ |
| Budgets | `/budgets` | ✅ |
| Goals | `/goals` | ✅ |
| Accounts | `/accounts` | 🛠️ Placeholder only |

---

## 🧱 Layout Components

### Navbar (Global Component) — ✅ Implemented

Responsibilities:

- Route navigation with active-state highlighting
- Display app identity (gradient logo text)
- Provide access to all main pages
- Theme toggle (dark/light)
- User account dropdown (profile + logout)
- Responsive Sheet drawer for mobile

### Navigation Links

- Dashboard → `/`
- Transactions → `/transactions`
- Budgets → `/budgets`
- Goals → `/goals`
- Accounts → `/accounts`

---

## 🔁 Routing — ✅ Implemented

Uses React Router v6:

- Protected routes for authenticated users (`ProtectedRoute` wrapper)
- Guest routes redirect logged-in users to Dashboard
- Highlight active route in navbar
- Nested routing via `AppLayout` outlet

---

## 🎨 UI Implementation — ✅ Implemented

- shadcn/ui components (Button, Card, Dialog, Select, Input, Label, Progress, Sheet, DropdownMenu, AlertDialog, Table)
- Tailwind CSS for layout and styling
- Custom CSS variables for theming
- Responsive navigation (Sheet for small screens)

---

## 🧠 State Management — ✅ Implemented

- React Context for:
  - Auth state (`AuthProvider` + `useAuth` hook)
  - Theme state (`ThemeProvider` + `useTheme` hook)
- Custom hooks per feature for data + CRUD state:
  - `useTransactions`, `useBudgets`, `useGoals`, `useDashboard`

---

## 🌐 API Layer — ✅ Implemented

- Axios instance (`apiClient.js`) with:
  - Base URL configuration
  - JWT token interceptor (auto-attaches Bearer token)
  - Error response interceptor
- Centralized service functions per module

---

## ⚙️ Best Practices — ✅ Followed

- Navbar is a reusable layout component
- Feature components are modular (Card + Form per module)
- Shared UI components (`ErrorBanner`, `FeedbackBanner`, `AmountCell`)
- Consistent spacing and styling via Tailwind
- Skeleton loaders for all data-driven sections
- Empty states with call-to-action buttons
