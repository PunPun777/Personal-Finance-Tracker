# 💡 AI-Powered Personal Finance Tracker

A production-grade **personal finance management platform** built with the MERN stack, featuring real-time budget tracking, transaction-linked goal progress, interactive dashboards with Recharts visualizations, and a premium dark mode UI with a custom indigo-violet gradient design system.

---

## 🎯 Problem Statement

Most individuals:

- Do not consistently track expenses
- Lack visibility into spending habits
- Struggle to plan and achieve financial goals
- Overspend without awareness

## 💡 Solution

A full-stack finance tracker that:

- Captures and categorizes financial data
- Visualizes insights with interactive charts
- Enables goal-based financial planning with transaction linking
- Provides real-time budget tracking with alerts
- (Future) Uses ML for predictions and smart recommendations

---

## ✨ Features

### ✅ Implemented

| Module | Highlights |
|---|---|
| **Authentication** | JWT-based signup/login, secure password hashing (bcrypt), protected routes, guest route redirection |
| **Transactions** | Full CRUD, 15 categories, optional goal linking, search & filter (date/category/type/description) |
| **Dashboard** | Summary cards (income/expense/savings), category pie chart, monthly bar chart, cash flow area chart, recent transactions table, financial insights |
| **Budgeting** | Per-category budget limits, real-time usage tracking via transaction aggregation, warning/over-budget indicators, progress bars |
| **Financial Goals** | Goal creation with target amount/date, auto-calculated savedAmount from linked expense transactions, feasibility analysis (on-track/at-risk/not-achievable), progress visualization |
| **Dark Mode** | Full light/dark theme toggle with localStorage persistence, smooth transitions |
| **Design System** | Custom indigo-violet gradient palette, glassmorphism navbar, card accent borders, responsive grid layouts |
| **INR Formatting** | Indian Rupee (₹) formatting with proper Indian numbering (1,00,000) across all monetary displays |
| **UX Polish** | Skeleton loading states, empty state illustrations, error/feedback banners, optimistic deletes with rollback |

### 🛠️ Planned Features

| Module | Description |
|---|---|
| **Accounts** | Multiple account support (cash, bank) with balance tracking |
| **Notifications** | Budget-exceeded alerts, goal deadline reminders, progress notifications |
| **Goal Insights** | Display required monthly savings, suggest budget adjustments |
| **AI Integration** | Auto-categorization (NLP), spending prediction, anomaly detection, goal feasibility prediction |

---

## 🧱 Tech Stack

### Frontend

- React 18 (JavaScript/JSX)
- Tailwind CSS + custom CSS variables
- shadcn/ui component library
- Recharts (interactive charts)
- Axios (API client with interceptors)
- React Router v6 (protected routing)

### Backend

- Node.js + Express.js
- MongoDB + Mongoose (ODM)
- JWT authentication
- express-validator (input validation)
- express-rate-limit, Helmet, CORS

### Future Integration

- Python (FastAPI for ML microservice)
- Scikit-learn / Prophet / Isolation Forest

---

## 🏗 Architecture

```
Frontend:  React → Hooks → Services → Axios → API
Backend:   Routes → Controllers → Services → Models → MongoDB
```

### Key Design Decisions

- **Computed, not stored** — Goal `savedAmount` is calculated via MongoDB aggregation from linked transactions, eliminating sync drift
- **Transaction → Goal linking** — Income allocated to goals is recorded as expense transactions with a `goalId` foreign key
- **Category-based budgets** — Budgets are persistent per-category (not per-month), with spend tracking computed from current-month transactions
- **Optimistic UI** — Deletes are reflected instantly in the UI, with automatic rollback on API failure

---

## 📂 Project Structure

```
/src                    → Frontend (React)
  /components           → Reusable UI components
  /pages                → Route-level page components
  /hooks                → Custom React hooks
  /services             → Axios API service functions
  /utils                → Utilities (formatINR, computeBudgetStats)
  /context              → Auth + Theme providers
  /layouts              → AppLayout (navbar + outlet)
  /constants            → Category lists, chart colors

/server/src             → Backend (Node + Express)
  /models               → Mongoose schemas (User, Transaction, Goal, Budget)
  /controllers          → HTTP request handlers
  /services             → Business logic layer
  /routes               → Express routers
  /validators           → express-validator rule sets
  /middleware            → Auth, validation, error handling
  /utils                → ApiError, apiResponse, JWT helpers

/docs/specs             → System design & product documentation
```

---

## 🏆 Key Highlights

> *For recruiters and technical reviewers*

- **Clean Architecture** — Strict separation: Routes → Controllers → Services → Models on backend; Pages → Hooks → Services on frontend
- **Real-time Computed Data** — Goal progress uses MongoDB `$match + $group` aggregation pipelines, not stale stored values
- **Production-grade Error Handling** — Custom `ApiError` class, centralized error middleware, consistent `{ success, message, data }` API envelope
- **Security** — JWT auth, bcrypt hashing, Helmet headers, rate limiting (100 req/15min), input validation on every endpoint, user-scoped data isolation
- **Modern UX** — Skeleton loaders, optimistic deletes, empty states, feedback banners, dark mode with smooth CSS transitions
- **Scalable Design** — Modular service architecture ready for ML microservice integration

---

## 📸 Screenshots

> *Screenshots to be added*

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repository
git clone https://github.com/PunPun777/Personal-Finance-Tracker.git
cd Personal-Finance-Tracker

# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install
```

### Environment Variables

Create `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/finance-tracker
JWT_SECRET=your-secret-key
CLIENT_ORIGIN=http://localhost:5173
```

### Run Development Servers

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
npm run dev
```

---

## 📌 Status

🟢 **Phase 1: MERN Development** — Core features complete  
🟡 **Phase 1.5: Accounts Module** — Planned  
⚪ **Phase 2: AI Integration** — Future

---

## 🔮 Future Scope

### Phase 1.5 — Remaining MERN Features

- Accounts module (multi-account support with balance tracking)
- Notification system (budget alerts, goal reminders)
- Goal insights (required monthly savings display, adjustment suggestions)
- TypeScript migration

### Phase 2 — AI Integration

- Auto expense categorization (TF-IDF + Logistic Regression)
- Spending prediction (Prophet time-series)
- Anomaly detection (Isolation Forest)
- Goal feasibility prediction (ML)
- Personalized financial recommendations
- FastAPI microservice architecture

---

## 👨‍💻 Author

**Punarvi M U**

---

## ⭐ Notes

This project is a **portfolio-grade application** demonstrating:

- Full-stack development (React + Node.js + MongoDB)
- Scalable, clean architecture
- Real-world problem solving
- Production-ready security and error handling
- AI integration readiness
