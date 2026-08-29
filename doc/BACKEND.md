# Backend Architecture

## Overview

Node.js + Express 5 REST API with MongoDB (Mongoose), Redis, Bull queues, and Nodemailer.

## Entry Point

`server.js` — starts Express, connects to MongoDB, starts Bull worker:

```javascript
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
    StartWorker();
});
```

## Folder Structure

```
backend/
├── config/
│   ├── db.js            # MongoDB connection (Mongoose)
│   ├── redis.js         # Redis client (ioredis)
│   └── cloudinary.js    # Cloudinary SDK config
├── controllers/
│   ├── auth.controller.js    # Register, login, profile
│   ├── product.controller.js # CRUD + reviews + search
│   ├── order.controller.js   # Create, list, pay, deliver
│   └── user.controller.js    # Admin user management
├── middleware/
│   ├── auth.middleware.js       # JWT verification (protect), admin check
│   ├── error.middleware.js      # 404 catch-all + central error handler
│   └── rateLimiter.middleware.js # Redis sliding window rate limiter
├── models/
│   ├── user.model.js     # User schema (bcrypt pre-save hook)
│   ├── product.model.js  # Product schema (embedded reviews, text index)
│   └── order.model.js    # Order schema (embedded orderItems, shippingAddress)
├── routes/
│   ├── auth.routes.js      # POST register/login, GET/PUT profile
│   ├── product.routes.js   # CRUD + reviews + top
│   ├── order.routes.js     # Create, myorders, pay, deliver
│   ├── user.routes.js      # Admin CRUD
│   └── upload.routes.js    # Image upload to Cloudinary
├── service/
│   ├── email.service.js    # Nodemailer transporter + order confirmation email
│   ├── queue.service.js    # Bull queue creation + job enqueueing
│   └── worker.service.js   # Bull worker processors (email + inventory)
├── validators/
│   ├── auth.validators.js    # register, login, updateProfile (Joi)
│   ├── product.validator.js  # create, update, review (Joi)
│   ├── order.validator.js    # createOrder, payOrder (Joi)
│   └── user.validator.js     # updateUser (Joi)
├── tests/                     # Jest + Supertest (87 tests)
├── scripts/
│   └── test-email.js          # Email service test script
├── seed.js                    # Database seeder
├── .env                       # Environment variables
└── server.js                  # Entry point
```

## Middleware Pipeline

### Request Flow

```
Request → express.json() → Route → rateLimiter → validate(Joi) → protect → admin → Controller → Response
                                                                                    ↓
                                                                              errorHandler()
```

### auth.middleware.js

**`protect(req, res, next)`**
1. Checks `Authorization: Bearer <token>` header
2. Verifies JWT with `JWT_SECRET`
3. Fetches user from MongoDB (excludes password)
4. Attaches `req.user`
5. Returns `401` if no token or invalid

**`admin(req, res, next)`**
1. Checks `req.user.isAdmin === true`
2. Returns `403` if not admin

### error.middleware.js

**`notFound(req, res, next)`**
- Catches any URL that didn't match a route
- Creates 404 error, passes to `errorHandler`

**`errorHandler(err, req, res, next)`**
- Normalizes Mongoose `CastError` → 404
- Normalizes `ValidationError` → 400
- Normalizes duplicate key error (code 11000) → 400
- Returns stack trace only in development

### rateLimiter.middleware.js

- Redis sorted set sliding window
- Default: 10 requests per 60 seconds per IP+endpoint
- **Fail-open:** if Redis is down, requests pass through
- Key format: `rate:auth:{ip}:{path}`

## Validation (Joi)

All request bodies are validated by Joi schemas before reaching controllers.

### Validation Flow

```javascript
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: error.details.map(d => d.message).join(', '),
    });
  }
  next();
};
```

Each route file defines this inline. `abortEarly: false` returns all validation errors at once.

### Schemas

| File | Schemas |
|---|---|
| `auth.validators.js` | `registerSchema`, `loginSchema`, `updateProfileSchema` |
| `product.validator.js` | `createProductSchema`, `updateProductSchema`, `reviewSchema` |
| `order.validator.js` | `createOrderSchema`, `payOrderSchema` |
| `user.validator.js` | `updateUserSchema` |

## Services

### email.service.js

- Creates Nodemailer transporter (Gmail SMTP)
- Lazy initialization (created on first use)
- `sendOrderConfirmationEmail(user, order)` — sends HTML email with order details
- Skips in test mode or if `EMAIL_HOST` not set
- Logs preview URL if using Ethereal
- Returns `null` on failure (non-blocking)

### queue.service.js

Creates two Bull queues:

1. **`order-confirmation`** — processes email sending
   - `attempts: 3`, `backoff: 5000ms`
2. **`inventory-sync`** — checks stock levels

`enqueueOrderJobs(order)` — adds jobs to both queues. Skips in test mode.

### worker.service.js

**`StartWorker()`** — called once at server startup.

**orderConfirmationQueue processor:**
1. Fetches order by ID
2. Fetches user by ID
3. Calls `sendOrderConfirmationEmail(user, order)`

**inventorySyncQueue processor:**
1. Fetches order with populated products
2. Flags items where `product.countInStock < orderItem.qty`
3. Logs warnings (does not block order)

## Authentication

### JWT Flow

```
1. User logs in → POST /api/auth/login
2. Backend generates JWT with { id: user._id }
3. Token returned in response body (not cookie)
4. Frontend stores in localStorage + Redux
5. All protected requests include Authorization: Bearer <token>
6. protect middleware verifies + attaches req.user
```

- Token is short-lived (no expiry set — defaults to no expiry)
- No refresh token mechanism
- No HTTP-only cookie (vulnerable to XSS)

### Password Hashing

- bcrypt with salt rounds = 10
- Pre-save Mongoose hook hashes on `save()` and `findOneAndUpdate()`
- `matchPassword()` instance method for login comparison

## File Upload

- **Multer** with memory storage (no disk writes)
- Max file size: 5MB
- Allowed types: JPEG, PNG, WebP, GIF
- File converted to base64 data URI
- Uploaded to Cloudinary (`ecommerce/products` folder)
- Returns `{ url, publicId }`

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Server port |
| `MONGO_URI` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | Yes | — | JWT signing secret |
| `REDIS_URL` | Yes | — | Redis connection string (for Bull + rate limiter) |
| `CLOUDINARY_CLOUD_NAME` | For uploads | — | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | For uploads | — | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | For uploads | — | Cloudinary API secret |
| `CLOUDINARY_URL` | For uploads | — | Full Cloudinary URL |
| `EMAIL_HOST` | For email | — | SMTP host (e.g., smtp.gmail.com) |
| `EMAIL_PORT` | For email | `587` | SMTP port |
| `EMAIL_USER` | For email | — | SMTP username |
| `EMAIL_PASS` | For email | — | SMTP password/app password |
| `EMAIL_FROM` | For email | — | Sender address |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Production start |
| `npm test` | Run Jest tests (87 tests) |
| `npm run seed` | Seed database with sample data |
| `npm run test:email` | Test email service |
