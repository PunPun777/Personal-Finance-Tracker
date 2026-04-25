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

---

## 🧭 Navbar (Top Navigation)

Create a reusable top navigation bar component with:

- Logo / app name on the left
- Navigation links:
  - Dashboard
  - Transactions
  - Budgets
  - Goals
  - Accounts
- User menu on the right (profile + logout)

Requirements:

- Sticky/fixed at top
- Highlight active route
- Responsive (collapse on smaller screens)
- Use reusable UI components (shadcn/ui preferred)

---

## ⚙️ Backend Setup

Create an Express server with:

- MongoDB connection (Mongoose)
- JWT authentication
- Proper folder structure (controllers, routes, services, models)

---

## 💰 Transaction API

Create CRUD APIs for transactions with:

- Fields: amount, category, description, date, userId
- Input validation
- Error handling
- Clean separation of concerns

---

## 🎯 Goal API

Create CRUD APIs for financial goals with:

- Fields: title, targetAmount, savedAmount, targetDate, userId
- Validation and error handling

---

## 🖥 React Form (Transactions)

Create a React component for adding transactions:

- Use reusable UI components
- Include:
  - amount input
  - category dropdown
  - description input
  - date picker

---

## 🎯 Goals UI

Create a React page for financial goals:

- Include:
  - Goal creation form
  - Progress bars
  - Cards for each goal
  - Remaining amount and time display

---

## 📊 Dashboard

Create a dashboard with:

- Category-wise pie chart
- Monthly bar chart
- Summary cards (income, expense, savings)

---

## ♻️ Refactor

Refactor this code to:

- Follow clean architecture
- Improve readability
- Improve scalability

---

## ✅ Validation

Add:

- Input validation
- Proper error handling
- User-friendly error messages
