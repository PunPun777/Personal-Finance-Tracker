# 🖥 Frontend Structure

/src
/components
/ui
/layout
Navbar.tsx
/pages
/hooks
/services
/utils

---

## 🧭 Navigation Structure

The application uses a **top navbar layout** that persists across all authenticated pages.

### Layout Flow

Navbar (Top)
↓
Page Content

---

## 📄 Pages

- Login
- Dashboard
- Transactions
- Budgets
- Accounts
- Goals

---

## 🧱 Layout Components

### Navbar (Global Component)

Responsibilities:

- Route navigation
- Display app identity
- Provide access to all main pages
- User account actions

### Navigation Links

- Dashboard → `/dashboard`
- Transactions → `/transactions`
- Budgets → `/budgets`
- Goals → `/goals`
- Accounts → `/accounts`

---

## 🔁 Routing

Use React Router:

- Protected routes for authenticated users
- Redirect unauthenticated users to login
- Highlight active route in navbar

---

## 🎨 UI Implementation

- Use reusable components (shadcn/ui preferred)
- Tailwind CSS for layout and styling
- Responsive navigation (collapse on small screens)

---

## 🧠 State Management

- React Context / Redux (optional)
- Store user session and auth state

---

## 🌐 API Layer

- Axios instance for API calls
- Centralized API service functions

---

## ⚙️ Best Practices

- Keep Navbar as a reusable layout component
- Avoid duplication across pages
- Maintain consistent spacing and styling
