# 🤖 Antigravity Prompts

## 🧠 General Instruction

- Follow clean architecture principles
- Write modular, production-ready code
- Avoid duplication
- Prefer reusable components and scalable patterns

---

## 🎨 UI Guidelines

- Use reusable component libraries wherever possible
- Prefer:
  - shadcn/ui components
  - or other modern reusable UI systems

- Do NOT build UI components from scratch if reusable versions exist
- Maintain consistent styling (spacing, typography, colors)
- Use Tailwind CSS
- Ensure responsive design
- Support dark mode (use CSS variables, not hardcoded colors)

---

## 🧭 Navbar (Top Navigation)

Create a reusable top navigation bar component with:

- Logo / app name on the left (gradient text)
- Navigation links:
  - Dashboard
  - Transactions
  - Budgets
  - Goals
  - Accounts
- Theme toggle (sun/moon icon)
- User menu on the right (profile + logout)

Requirements:

- Sticky/fixed at top
- Highlight active route
- Responsive (collapse into Sheet on smaller screens)
- Glassmorphism background (gradient + backdrop blur)
- Use reusable UI components (shadcn/ui preferred)

---

## ⚙️ Backend Setup

Create an Express server with:

- MongoDB connection (Mongoose)
- JWT authentication
- Proper folder structure (controllers, routes, services, models, validators)
- Rate limiting and Helmet security headers

---

## 💰 Transaction API

Create CRUD APIs for transactions with:

- Fields: amount, category, description, date, type, userId, goalId (optional)
- Input validation (express-validator)
- Error handling (ApiError class)
- Clean separation of concerns (controller → service → model)

---

## 🎯 Goal API

Create CRUD APIs for financial goals with:

- Fields: title, targetAmount, targetDate, monthlyContribution (optional), status, userId
- savedAmount is computed via aggregation (NOT a user input)
- Validation and error handling

---

## 🎯 Budget API

Create CRUD APIs for budgets with:

- Fields: category, limit, userId, categoryBudgets (optional)
- One budget per user per category (compound unique index)
- 409 Conflict on duplicate creation

---

## 🖥 React Form (Transactions)

Create a React component for adding transactions:

- Use reusable UI components
- Include:
  - type selector (income/expense)
  - amount input
  - category dropdown
  - description input
  - date picker
  - goal selector (optional, shown for expense type only)

---

## 🎯 Goals UI

Create a React page for financial goals:

- Include:
  - Goal creation form (no savedAmount input)
  - Progress bars with color-coded status
  - Cards for each goal
  - Remaining amount and time display
  - Feasibility badges (on-track / at-risk)

---

## 📊 Dashboard

Create a dashboard with:

- Category-wise pie chart (donut style)
- Monthly bar chart (expenses)
- Cash flow area chart (income vs expense)
- Summary cards (income, expense, savings) with INR formatting
- Insight cards (top category, daily average, savings rate)
- Recent transactions table
- Skeleton loaders and empty states

---

## 💱 Currency

- Use INR (₹) formatting across the entire application
- Use `formatINR()` and `formatINRCompact()` from `/utils/formatINR.js`
- Indian numbering system (1,00,000)

---

## ♻️ Refactor

Refactor this code to:

- Follow clean architecture
- Improve readability
- Improve scalability
- Support dark mode

---

## ✅ Validation

Add:

- Input validation (express-validator)
- Proper error handling (ApiError + centralized errorHandler)
- User-friendly error messages
- Consistent API response envelope
