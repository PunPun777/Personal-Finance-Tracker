# 🏗 System Architecture

## 🧱 Stack (Phase 1 - MERN) — ✅ Implemented

Frontend:

- React (JavaScript/JSX)
- Tailwind CSS + custom CSS variables
- shadcn/ui component library
- Recharts (data visualization)

Backend:

- Node.js
- Express.js

Database:

- MongoDB (Mongoose ODM)

## 🔄 Data Flow

```
User → React UI → Custom Hook → Axios Service → Express API → Service Layer → MongoDB
```

## 📦 Future Architecture (Phase 2) — 🛠️ Planned

```
React → Node API → MongoDB
              ↓
        Python ML Service (FastAPI)
```

## ⚙️ Services — ✅ Implemented

- Auth Service (register, login, JWT)
- Transaction Service (CRUD + summary aggregation + atomic account balance updates)
- Goal Service (CRUD + computed savedAmount via aggregation)
- Budget Service (CRUD + duplicate prevention)
- Account Service (CRUD + duplicate name prevention + balance tracking)

## 🔐 Security — ✅ Implemented

- JWT authentication (Bearer token)
- Secure password hashing (bcrypt)
- Input validation (express-validator)
- Rate limiting (100 requests / 15 minutes)
- Helmet security headers
- CORS configuration
- User-scoped data isolation (all queries filter by userId)

## 🏗 Architecture Patterns — ✅ Implemented

- **Backend:** Routes → Controllers → Services → Models
- **Frontend:** Pages → Hooks → Services → Axios
- **Error Handling:** Custom `ApiError` class + centralized error middleware
- **API Envelope:** Consistent `{ success, message, data }` response format
- **Optimistic UI:** Immediate state updates with rollback on API failure
- **Computed Data:** Goal savedAmount derived from transaction aggregation, not stored

## 📈 Scalability

- Modular backend (each feature is a standalone controller + service + model)
- Service-based architecture ready for microservice extraction
- MongoDB compound indexes for query performance
