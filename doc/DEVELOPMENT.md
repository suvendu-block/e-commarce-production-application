# Development Guide

## Prerequisites

- **Node.js** 20+ (recommended: 22)
- **npm** 10+
- **MongoDB** 7+ (local installation or MongoDB Atlas)
- **Redis** 7+ (local installation or Upstash)

## Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd e-commarce

# Backend
cd backend
npm install

# Frontend (new terminal)
cd frontend
npm install
```

### 2. Environment Variables

#### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/nordstroma
JWT_SECRET=your-secret-key-here
REDIS_URL=redis://localhost:6379

# Optional: Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Email (for order confirmations)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=E-Commerce <your@gmail.com>
```

#### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_USE_MOCK=true    # Set to false when backend is running
```

### 3. Run

```bash
# Backend (terminal 1)
cd backend
npm run dev           # http://localhost:5000

# Frontend (terminal 2)
cd frontend
npm run dev           # http://localhost:5173
```

## Available Scripts

### Root

| Script | Description |
|---|---|
| `npm run dev` | Start both backend and frontend concurrently |

### Backend (`cd backend`)

| Script | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-reload on changes) |
| `npm start` | Production start |
| `npm test` | Run all tests (87 tests, Jest + Supertest) |
| `npm run seed` | Seed database with sample products and users |
| `npm run test:email` | Test email service configuration |

### Frontend (`cd frontend`)

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests once (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

## Testing

### Backend Tests

- **Framework:** Jest 30 + Supertest 7
- **Database:** mongodb-memory-server (in-memory MongoDB)
- **Run:** `cd backend && npm test`
- **Count:** 87 tests across auth, products, orders, users

Test files are in `backend/tests/`:
- `auth.test.js` — registration, login, profile
- `product.test.js` — CRUD, search, reviews
- `order.test.js` — create, list, pay, deliver
- `user.test.js` — admin user management
- `middleware.test.js` — error handler, rate limiter

### Frontend Tests

- **Framework:** Vitest 4 + Testing Library 16
- **DOM:** jsdom
- **Run:** `cd frontend && npm test`
- **Count:** 23 tests

Test files are co-located with components (e.g., `*.test.jsx`).

## Common Issues

### MongoDB Connection

```
MongooseError: connect ECONNREFUSED 127.0.0.1:27017
```

**Fix:** Start MongoDB locally or update `MONGO_URI` in `.env`.

### Redis Connection

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Fix:** Start Redis locally or update `REDIS_URL` in `.env`. The rate limiter fails open (requests pass through if Redis is down), but Bull queues won't work without Redis.

### Mock Mode Not Working

If frontend shows errors in mock mode:
1. Check `VITE_USE_MOCK` is `true` (or unset) in `frontend/.env`
2. Restart Vite dev server after changing `.env` (Vite doesn't hot-reload env vars)

### Port Already in Use

```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

## Mock Mode vs Live Mode

| Feature | Mock Mode | Live Mode |
|---|---|---|
| Backend required | No | Yes |
| MongoDB required | No | Yes |
| Redis required | No | Yes (for rate limiting + queues) |
| Data persistence | In-memory (resets on refresh) | MongoDB (persistent) |
| Authentication | Simulated JWT | Real JWT |
| File uploads | Simulated | Cloudinary |
| Email | Disabled | Nodemailer + Bull queue |
| Search | In-memory filter | MongoDB text index |

## Demo Accounts

### Mock Mode

| Email | Password | Role |
|---|---|---|
| admin@example.com | admin123 | Admin |
| john@example.com | john123 | User |

### Live Mode

Create accounts via POST `/api/auth/register` or seed with `npm run seed`.
