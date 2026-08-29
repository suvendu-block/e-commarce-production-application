# API Reference

Base URL: `http://localhost:5000/api` (local) or `https://your-backend.onrender.com/api` (production)

All endpoints return JSON. Protected endpoints require `Authorization: Bearer <token>` header.

---

## Error Response Format

```json
{
  "message": "Error description"
}
```

Status codes used: `200` OK, `201` Created, `400` Bad Request, `401` Unauthorized, `403` Forbidden, `404` Not Found, `429` Too Many Requests, `500` Server Error.

---

## Auth

### POST /api/auth/register

Create a new user account.

**Auth:** None  
**Rate limited:** Yes (10 req/min per IP)

**Request Body:**
```json
{
  "name": "John Doe",        // string, 2-50 chars, required
  "email": "john@example.com", // valid email, required
  "password": "john123"       // string, min 6 chars, required
}
```

**Response:** `201 Created`
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "name": "John Doe",
  "email": "john@example.com",
  "isAdmin": false,
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**
- `400` — Validation failed (missing/invalid fields)
- `400` — User already exists (duplicate email)

---

### POST /api/auth/login

Authenticate and receive a JWT.

**Auth:** None  
**Rate limited:** Yes

**Request Body:**
```json
{
  "email": "john@example.com",  // required
  "password": "john123"         // required
}
```

**Response:** `200 OK`
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "name": "John Doe",
  "email": "john@example.com",
  "isAdmin": false,
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**
- `400` — Invalid email or password

---

### GET /api/auth/profile

Get the authenticated user's profile.

**Auth:** Bearer token required  
**Rate limited:** Yes

**Response:** `200 OK`
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "name": "John Doe",
  "email": "john@example.com",
  "isAdmin": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### PUT /api/auth/profile

Update the authenticated user's profile.

**Auth:** Bearer token required  
**Rate limited:** Yes

**Request Body (all optional, at least one required):**
```json
{
  "name": "John Updated",     // 2-50 chars
  "email": "new@example.com", // valid email
  "password": "newpass123"    // min 6 chars
}
```

**Response:** `200 OK` — Updated user object + new token

---

## Products

### GET /api/products

List products with filtering, search, and pagination.

**Auth:** None  
**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `keyword` | string | Search by name/description (text index) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |
| `category` | string | Filter by category |
| `minPrice` | number | Minimum price |
| `maxPrice` | number | Maximum price |

**Response:** `200 OK`
```json
{
  "products": [
    {
      "_id": "...",
      "name": "Wireless Headphones",
      "slug": "wireless-headphones",
      "image": "https://res.cloudinary.com/...",
      "brand": "Sony",
      "category": "Electronics",
      "description": "...",
      "price": 299.99,
      "countInStock": 50,
      "rating": 4.5,
      "numReviews": 12,
      "reviews": [...]
    }
  ],
  "page": 1,
  "pages": 3,
  "count": 25
}
```

---

### GET /api/products/top

Get top-rated products (for homepage carousel).

**Auth:** None

**Response:** `200 OK` — Array of top products (sorted by rating)

---

### GET /api/products/:id

Get a single product by ID.

**Auth:** None

**Response:** `200 OK` — Full product object with reviews

**Errors:**
- `404` — Product not found
- `400` — Invalid ObjectId format

---

### POST /api/products

Create a new product (admin only).

**Auth:** Bearer token + Admin  
**Request Body:**
```json
{
  "name": "New Product",          // 2-100 chars, required
  "price": 49.99,                 // positive number, required
  "description": "Great product", // max 2000 chars
  "image": "",                    // Cloudinary URL (or empty)
  "brand": "BrandName",           // max 50 chars
  "category": "Electronics",      // max 50 chars
  "countInStock": 100             // integer >= 0
}
```

**Response:** `201 Created` — Created product object

---

### PUT /api/products/:id

Update a product (admin only).

**Auth:** Bearer token + Admin  
**Request Body:** Same as create, all fields optional (at least one required)

**Response:** `200 OK` — Updated product object

---

### DELETE /api/products/:id

Delete a product (admin only).

**Auth:** Bearer token + Admin

**Response:** `200 OK`
```json
{ "message": "Product removed" }
```

---

### POST /api/products/:id/reviews

Add a review to a product.

**Auth:** Bearer token required  
**Request Body:**
```json
{
  "rating": 5,          // integer 1-5, required
  "comment": "Great!"   // 3-1000 chars, required
}
```

**Response:** `201 Created`

**Errors:**
- `400` — Product already reviewed by this user

---

## Orders

### POST /api/orders

Place a new order.

**Auth:** Bearer token required  
**Request Body:**
```json
{
  "orderItems": [
    {
      "product": "64f1a2b3c4d5e6f7a8b9c0d1",  // Product ObjectId, required
      "qty": 2                                    // integer >= 1, required
    }
  ],
  "shippingAddress": {
    "address": "123 Main St",     // 3-200 chars, required
    "city": "Mumbai",             // 2-50 chars, required
    "postalCode": "400001",       // 2-20 chars, required
    "country": "India"            // 2-50 chars, required
  },
  "paymentMethod": "COD"          // only "COD" allowed
}
```

**Response:** `201 Created`
```json
{
  "_id": "...",
  "user": "...",
  "orderItems": [...],
  "shippingAddress": {...},
  "paymentMethod": "COD",
  "itemsPrice": 599.98,
  "taxPrice": 48.00,
  "shippingPrice": 0,
  "totalPrice": 647.98,
  "isPaid": false,
  "isDelivered": false,
  "createdAt": "..."
}
```

**Side effects:** Enqueues email confirmation and inventory sync jobs via Bull queue.

---

### GET /api/orders/myorders

Get all orders for the authenticated user.

**Auth:** Bearer token required

**Response:** `200 OK` — Array of order objects (sorted by newest first)

---

### GET /api/orders

List all orders (admin only).

**Auth:** Bearer token + Admin

**Response:** `200 OK` — Array of all orders with user name populated

---

### GET /api/orders/:id

Get a single order by ID.

**Auth:** Bearer token required

**Response:** `200 OK` — Full order object

**Errors:**
- `404` — Order not found
- `403` — Not your order (non-admin)

---

### PUT /api/orders/:id/pay

Mark an order as paid (admin only).

**Auth:** Bearer token + Admin  
**Request Body:**
```json
{
  "paymentResult": {
    "id": "pay_123",
    "status": "completed",
    "updateTime": "2024-01-15T12:00:00Z",
    "emailAddress": "john@example.com"
  }
}
```

**Response:** `200 OK` — Updated order with `isPaid: true`, `paidAt: <timestamp>`

---

### PUT /api/orders/:id/deliver

Mark an order as delivered (admin only).

**Auth:** Bearer token + Admin

**Response:** `200 OK` — Updated order with `isDelivered: true`, `deliveredAt: <timestamp>`

---

## Users (Admin)

### GET /api/users

List all users (admin only).

**Auth:** Bearer token + Admin

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "isAdmin": false,
    "createdAt": "..."
  }
]
```

Note: Passwords are excluded from the response.

---

### GET /api/users/:id

Get a user by ID (admin only).

**Auth:** Bearer token + Admin

**Response:** `200 OK` — User object without password

---

### PUT /api/users/:id

Update a user (admin only).

**Auth:** Bearer token + Admin  
**Request Body (all optional, at least one required):**
```json
{
  "name": "Updated Name",     // 2-50 chars
  "email": "new@example.com", // valid email
  "isAdmin": true             // boolean
}
```

**Response:** `200 OK` — Updated user object

---

### DELETE /api/users/:id

Delete a user (admin only).

**Auth:** Bearer token + Admin

**Response:** `200 OK`
```json
{ "message": "User removed" }
```

---

## Upload

### POST /api/upload

Upload an image to Cloudinary (admin only).

**Auth:** Bearer token + Admin  
**Content-Type:** `multipart/form-data`  
**Field name:** `image`  
**Constraints:** JPEG, PNG, WebP, GIF only. Max 5MB.

**Response:** `201 Created`
```json
{
  "url": "https://res.cloudinary.com/.../image.jpg",
  "publicId": "ecommerce/products/abc123"
}
```

**Errors:**
- `400` — No file provided
- `400` — File too large or wrong type
- `500` — Cloudinary upload failed
