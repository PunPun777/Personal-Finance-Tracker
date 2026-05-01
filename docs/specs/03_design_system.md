# 🎨 Design System

## 🎯 Design Goals

- Clean, premium aesthetic
- Data-focused layouts
- Consistent navigation
- Mobile responsive
- Dark mode support

## 🌈 Color Palette

### Light Mode

- Primary: Indigo-Violet gradient (`--gradient-start`, `--gradient-mid`, `--gradient-end`)
- Background: HSL-based CSS variables (`--background`)
- Foreground: HSL-based CSS variables (`--foreground`)
- Destructive: Red for errors and delete actions
- Muted: Subtle grays for secondary text

### Dark Mode

- Background: Soft dark gray (not pure black) for reduced eye strain
- Gradient tones deepen automatically via CSS variables
- All components adapt via `.dark` class on `<html>`

## 🎨 Gradient System — ✅ Implemented

Custom CSS utility classes defined in `src/index.css`:

- `bg-gradient-primary` — Indigo → Violet → Blue (buttons, active nav items)
- `bg-gradient-navbar` — Subtle background → muted blend with `backdrop-blur-md`
- `text-gradient-primary` — Gradient text for brand logo
- `card-gradient-accent` — 4px gradient top-border on cards via `::before` pseudo-element

## 🔤 Typography

- Font: System defaults (Inter/Poppins recommended but not explicitly loaded)
- Headings: Bold, tracking-tight
- Body: Regular weight

## 🧭 Navigation (Top Navbar) — ✅ Implemented

### Structure

A fixed top navigation bar visible across all authenticated pages.

### Elements

- Logo / App Name (left) — uses `text-gradient-primary`
- Navigation Links (left-aligned):
  - Dashboard
  - Transactions
  - Budgets
  - Goals
  - Accounts
- Theme Toggle (right) — Sun/Moon icon button
- User Menu (right):
  - User avatar with gradient background
  - Profile info
  - Logout

### Behavior

- Sticky (fixed at top)
- Highlights active route with `bg-gradient-primary`
- Collapses into Sheet (slide-out menu) on mobile
- Glassmorphism effect with backdrop blur
- Accessible from all authenticated pages

### UI Guidelines

- shadcn/ui components used throughout
- Consistent spacing and alignment
- Hover and active states on all interactive elements

---

## 🧱 Components

### Navbar

- Fixed top layout with gradient background
- Flex container
- Responsive menu (Sheet for mobile)

### Buttons

- Primary: Gradient background (`bg-gradient-primary`)
- Secondary: Outline variant
- Ghost: Icon buttons for edit/delete
- Destructive: Red for delete confirmations

### Inputs

- Rounded borders
- Focus ring
- Dark mode compatible

### Cards

- `rounded-xl` with shadow
- `card-gradient-accent` top border
- `transition-colors duration-300` for theme switching

### Tables

- Clean rows with hover highlight
- Responsive overflow handling
- Action buttons appear on row hover (desktop)

---

## 📊 Charts — ✅ Implemented

- **Pie chart** — Category-wise expense breakdown (donut style)
- **Bar chart** — Monthly expense totals
- **Area chart** — Cash flow (income vs expense over time)
- 🛠️ Line chart (standalone trend) — Planned

Charts use Recharts with theme-aware tooltip styling.

---

## 🌙 Modes — ✅ Implemented

- Light mode (default)
- Dark mode with toggle button
- Theme persisted in localStorage
- Smooth 300ms CSS transitions

---

## 💱 Currency — ✅ Implemented

- All monetary values in INR (₹)
- Indian numbering format (1,00,000)
- `formatINR()` and `formatINRCompact()` utilities

---

## 📱 Responsiveness — ✅ Implemented

- Mobile-first design
- Navbar collapses into Sheet drawer
- Grid-based layouts (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- Tables with horizontal overflow on mobile

---

## 🦴 Loading & Empty States — ✅ Implemented

- Skeleton loaders for all data sections
- Animated pulse placeholders
- Illustrated empty states with call-to-action buttons
- Error banners with retry buttons
- Feedback banners (success/error) with auto-dismiss
