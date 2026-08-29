# Nordstroma — Developer Documentation

A full-stack e-commerce application built with Node.js/Express backend and React/Vite frontend.

## Quick Start

### Prerequisites

- **Node.js** 20+
- **MongoDB** 7+ (local or Atlas)
- **Redis** 7+ (local or Upstash)

### Setup

```bash
# Clone the repo
git clone <repo-url>
cd e-commarce

# Backend
cd backend
cp .env.example .env   # or create .env manually (see below)
npm install
npm run dev             # http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev             # http://localhost:5173
```

### Backend `.env` (minimum)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/nordstroma
JWT_SECRET=your-secret-here
REDIS_URL=redis://localhost:6379
```

### Frontend `.env` (optional)

```
VITE_API_URL=http://localhost:5000/api
VITE_USE_MOCK=true      # set to false when backend is running
```

### Demo Accounts (mock mode)

| Email | Password | Role |
|---|---|---|
| admin@example.com | admin123 | Admin |
| john@example.com | john123 | User |

---

## Documentation Index

| Document | Description |
|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, data flow, tech stack |
| [API-REFERENCE.md](./API-REFERENCE.md) | All 22 REST endpoints with schemas |
| [FRONTEND.md](./FRONTEND.md) | Redux store, routing, mock system, components |
| [BACKEND.md](./BACKEND.md) | Express pipeline, middleware, services, queue |
| [DATABASE.md](./DATABASE.md) | Mongoose schemas (User, Product, Order) |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Dev setup, scripts, testing |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Vercel + Render deployment |
| [KNOWN-ISSUES.md](./KNOWN-ISSUES.md) | Known bugs, TODOs, technical debt |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Redux Toolkit, Tailwind CSS, React Hook Form + Zod |
| Backend | Node.js, Express 5, Mongoose 9, Joi validation |
| Database | MongoDB 7+, Redis 7+ |
| Queue | Bull (Redis-backed) |
| Email | Nodemailer (Gmail SMTP) |
| Uploads | Cloudinary via Multer (memory storage) |
| Auth | JWT (access token in header, user data in localStorage) |
| Testing | Jest + Supertest (backend), Vitest + Testing Library (frontend) |
| CI/CD | GitHub Actions |

---

## Project Structure

```
e-commarce/
├── backend/
│   ├── config/          # db.js, redis.js, cloudinary.js
│   ├── controllers/     # auth, product, order, user
│   ├── middleware/       # auth, error, rateLimiter
│   ├── models/          # User, Product, Order (Mongoose)
│   ├── routes/          # auth, product, order, user, upload
│   ├── service/         # email, queue, worker
│   ├── validators/      # Joi schemas
│   ├── tests/           # Jest + Supertest
│   └── server.js        # Express entry point
├── frontend/
│   └── src/
│       ├── api/         # Axios instances + mock data
│       ├── components/  # UI primitives (Shadcn-based)
│       ├── constants/   # App config
│       ├── hooks/       # Custom hooks
│       ├── pages/       # Route-level components
│       └── store/       # Redux slices
├── doc/                 # This documentation
└── .github/workflows/   # CI pipeline
```
