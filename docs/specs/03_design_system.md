# 🎨 Design System

## 🎯 Design Goals

- Clean
- Minimal
- Data-focused
- Consistent navigation
- Mobile responsive

## 🌈 Color Palette

- Primary: #4F46E5 (Indigo)
- Secondary: #22C55E (Green)
- Danger: #EF4444 (Red)
- Background: #F9FAFB
- Text: #111827

## 🔤 Typography

- Font: Inter / Poppins
- Headings: Bold
- Body: Regular

## 🧭 Navigation (Top Navbar)

### Structure

A fixed top navigation bar visible across all authenticated pages.

### Elements

- Logo / App Name (left)
- Navigation Links (center or left-aligned):
  - Dashboard
  - Transactions
  - Budgets
  - Goals
  - Accounts
- User Menu (right):
  - Profile
  - Logout

### Behavior

- Sticky (fixed at top)
- Highlights active route
- Collapses into menu on smaller screens
- Accessible from all pages

### UI Guidelines

- Use reusable components (shadcn/ui preferred)
- Maintain consistent spacing and alignment
- Include hover and active states

---

## 🧱 Components

### Navbar

- Fixed top layout
- Flex container
- Responsive menu (hamburger for mobile)

### Buttons

- Primary (solid)
- Secondary (outline)

### Inputs

- Rounded borders
- Focus ring

### Cards

- Shadow-md
- Rounded-xl
- Padding: 16px

### Tables

- Clean rows
- Hover highlight

---

## 📊 Charts

- Pie chart (category)
- Bar chart (monthly)
- Line chart (trend)

---

## 🌙 Modes

- Light mode (default)
- Dark mode (optional)

---

## 📱 Responsiveness

- Mobile-first design
- Navbar collapses into dropdown/menu
- Grid-based layout
