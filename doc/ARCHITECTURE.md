# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                    │
│  React 19 + Vite 8 + Redux Toolkit + Tailwind CSS      │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Pages   │  │Components│  │  Store   │              │
│  │ (routes) │──│ (UI)     │──│ (Redux)  │              │
│  └──────────┘  └──────────┘  └────┬─────┘              │
│                                    │                     │
│                           ┌────────▼────────┐           │
│                           │   API Layer     │           │
│                           │  (Axios/Mock)   │           │
│                           └────────┬────────┘           │
└────────────────────────────────────┼────────────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │    VITE_USE_MOCK    │
                          │     true/false      │
                          └──┬─────────────┬────┘
                             │             │
                ┌────────────▼──┐    ┌─────▼──────────────┐
                │  Mock DB      │    │  Express Backend    │
                │ (in-memory)   │    │  (port 5000)        │
                └───────────────┘    └──┬──────┬──────┬───┘
                                        │      │      │
                              ┌─────────▼┐ ┌──▼───┐ ┌▼─────────┐
                              │ MongoDB  │ │Redis │ │Cloudinary│
                              │ (Mongoose│ │(Bull)│ │(uploads) │
                              └──────────┘ └──────┘ └──────────┘
```

## Two-Mode Architecture

The frontend operates in one of two modes controlled by `VITE_USE_MOCK`:

### Mock Mode (default)

- `VITE_USE_MOCK=true` (or unset)
- All API calls resolve to `src/api/mockData.js` — an in-memory JavaScript database
- No backend, MongoDB, or Redis needed
- Data resets on page refresh
- 8 pre-seeded products, 2 users (admin + regular)

### Live Mode

- `VITE_USE_MOCK=false`
- Frontend hits real Express API at `VITE_API_URL`
- Full MongoDB persistence, Redis rate limiting, Cloudinary uploads
- Bull queue processes email and inventory jobs

## Request Flow

### Authentication

```
1. User submits login form (React Hook Form + Zod)
2. authApi.login() → POST /api/auth/login
3. Backend validates with Joi, checks bcrypt hash
4. Returns JWT token + user object
5. Frontend stores in Redux authSlice + localStorage
6. All subsequent API calls include Authorization: Bearer <token>
7. protect middleware verifies JWT, attaches req.user
```

### Order Placement

```
1. User clicks "Place Order"
2. orderApi.createOrder() → POST /api/orders
3. Backend validates orderItems (Joi), fetches product prices server-side
4. Calculates tax (8%), shipping ($10 or free over $100)
5. Saves Order to MongoDB
6. enqueueOrderJobs() pushes to Bull queues:
   a. order-confirmation → worker sends email via Nodemailer
   b. inventory-sync → worker checks stock levels
7. Returns created order to frontend
8. Frontend clears cart, redirects to order confirmation
```

### Image Upload

```
1. Admin selects image file
2. uploadApi.uploadImage() → POST /api/upload (multipart/form-data)
3. Multer processes in memory (no disk write)
4. File converted to base64 data URI
5. Uploaded to Cloudinary (folder: ecommerce/products)
6. Returns { url, publicId }
7. URL saved to product.image field
```

## Middleware Pipeline

Express processes requests through this chain:

```
Request
  │
  ▼
express.json()          ← body parsing
  │
  ▼
Route matcher           ← /api/auth, /api/products, etc.
  │
  ▼
rateLimiter()           ← Redis sliding window (10 req/min)
  │
  ▼
validate(schema)        ← Joi body validation
  │
  ▼
protect()               ← JWT verification (if protected route)
  │
  ▼
admin()                 ← isAdmin check (if admin route)
  │
  ▼
Controller              ← Business logic
  │
  ▼
Response / Error
  │
  ▼
errorHandler()          ← Central error normalization
```

## Auth Flow

```
                    ┌──────────────┐
                    │  Login Page  │
                    └──────┬───────┘
                           │ POST /api/auth/login
                           ▼
                    ┌──────────────┐
                    │   Backend    │
                    │  bcrypt + JWT│
                    └──────┬───────┘
                           │ { user, token }
                           ▼
                    ┌──────────────┐
                    │  authSlice   │
                    │ Redux store  │
                    │ localStorage │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         ┌────────┐  ┌────────┐  ┌────────┐
         │ Header │  │Protected│  │ Admin  │
         │ (user  │  │ Routes  │  │ Routes │
         │  menu) │  │(Private │  │(Admin  │
         └────────┘  │ Route)  │  │ Route) │
                     └────────┘  └────────┘
```

- **PrivateRoute**: checks `auth.user !== null`
- **AdminRoute**: checks `auth.user.isAdmin === true`
- No refresh tokens — JWT is short-lived and user re-authenticates on expiry

## Database Relationships

```
User (1) ──────── (many) Order
User (1) ──────── (many) Review (embedded in Product)
Product (1) ────── (many) OrderItem (snapshot in Order)
Product (1) ────── (many) Review (embedded subdocument)
```

- Reviews are embedded in Product (not a separate collection)
- OrderItems snapshot the product name, price, and image at purchase time
- Order references User via `user` ObjectId
- OrderItem references Product via `product` ObjectId

## Tech Stack Details

| Component | Choice | Why |
|---|---|---|
| Backend framework | Express 5 | Mature, flexible, large ecosystem |
| ORM | Mongoose 9 | Schema validation, middleware hooks, MongoDB native |
| Validation | Joi | Declarative schemas, error formatting |
| Auth | JWT (jsonwebtoken) | Stateless, no session store needed |
| Rate limiting | Redis sorted sets | Sliding window, fast, shared across instances |
| Job queue | Bull | Redis-backed, retries, backoff, concurrency |
| Email | Nodemailer | Simple SMTP, works with Gmail |
| Uploads | Cloudinary | CDN, transforms, free tier |
| Frontend | React 19 + Vite 8 | Fast HMR, ESBuild, lazy loading |
| State | Redux Toolkit | Predictable, devtools, Immer integration |
| Forms | React Hook Form + Zod | Minimal re-renders, schema validation |
| Styling | Tailwind CSS | Utility-first, responsive, consistent |
