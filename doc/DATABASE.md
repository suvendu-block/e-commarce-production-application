# Database Schemas

MongoDB collections managed by Mongoose 9.

---

## User

**Collection:** `users`

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `name` | String | Yes | — | 2-50 characters |
| `email` | String | Yes | — | Unique, valid email |
| `password` | String | Yes | — | bcrypt hashed (10 rounds) |
| `isAdmin` | Boolean | No | `false` | Admin flag |
| `createdAt` | Date | Auto | `now` | Timestamps enabled |
| `updatedAt` | Date | Auto | `now` | Timestamps enabled |

**Indexes:**
- `email` — unique index (enforced by Mongoose `unique: true`)

**Hooks:**
- `pre('save')` — hashes password with bcrypt if modified

**Instance Methods:**
- `matchPassword(enteredPassword)` — compares plaintext against bcrypt hash

**Response Note:** Password field is excluded from all API responses via `.select('-password')`.

```javascript
// Example document
{
  _id: ObjectId("64f1a2b3c4d5e6f7a8b9c0d1"),
  name: "John Doe",
  email: "john@example.com",
  isAdmin: false,
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z")
}
```

---

## Product

**Collection:** `products`

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `name` | String | Yes | — | 2-100 characters |
| `slug` | String | Yes | auto-generated | Unique, URL-friendly name |
| `image` | String | No | — | Cloudinary URL |
| `brand` | String | No | — | Max 50 chars |
| `category` | String | No | — | Max 50 chars |
| `description` | String | No | — | Max 2000 chars |
| `price` | Number | Yes | `0` | Positive |
| `countInStock` | Number | Yes | `0` | Integer >= 0 |
| `rating` | Number | No | `0` | Aggregated average of reviews |
| `numReviews` | Number | No | `0` | Count of reviews |
| `reviews` | [Review] | No | `[]` | Embedded subdocuments |
| `createdAt` | Date | Auto | `now` | |
| `updatedAt` | Date | Auto | `now` | |

**Indexes:**
- `category` — for category filtering
- `price` — for price range queries
- `name: 'text', description: 'text'` — for keyword search

**Hooks:**
- `pre('validate')` — auto-generates slug from name if not provided

### Review (Embedded Subdocument)

| Field | Type | Required | Notes |
|---|---|---|---|
| `user` | ObjectId → User | Yes | Reference to author |
| `name` | String | Yes | Author's display name |
| `rating` | Number | Yes | 1-5 |
| `comment` | String | Yes | 3-1000 chars |
| `createdAt` | Date | Auto | Timestamps enabled |
| `updatedAt` | Date | Auto | Timestamps enabled |

**Constraint:** One review per user per product (enforced in controller).

```javascript
// Example document
{
  _id: ObjectId("..."),
  name: "Wireless Headphones",
  slug: "wireless-headphones",
  image: "https://res.cloudinary.com/.../image.jpg",
  brand: "Sony",
  category: "Electronics",
  description: "Premium noise-cancelling headphones",
  price: 299.99,
  countInStock: 50,
  rating: 4.5,
  numReviews: 2,
  reviews: [
    {
      user: ObjectId("..."),
      name: "John Doe",
      rating: 5,
      comment: "Amazing sound quality!",
      createdAt: ISODate("..."),
      updatedAt: ISODate("...")
    }
  ],
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

---

## Order

**Collection:** `orders`

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `user` | ObjectId → User | Yes | — | Order owner |
| `orderItems` | [OrderItem] | Yes | — | Embedded subdocuments |
| `shippingAddress` | ShippingAddress | Yes | — | Embedded subdocument |
| `paymentMethod` | String | Yes | — | Only `'COD'` allowed |
| `paymentResult` | Object | No | — | `{ id, status, updateTime, emailAddress }` |
| `itemsPrice` | Number | Yes | `0` | Sum of item prices |
| `taxPrice` | Number | Yes | `0` | 8% of itemsPrice |
| `shippingPrice` | Number | Yes | `0` | $10 flat or free over $100 |
| `totalPrice` | Number | Yes | `0` | itemsPrice + taxPrice + shippingPrice |
| `isPaid` | Boolean | No | `false` | Marked by admin |
| `paidAt` | Date | No | — | Set on payment |
| `isDelivered` | Boolean | No | `false` | Marked by admin |
| `deliveredAt` | Date | No | — | Set on delivery |
| `createdAt` | Date | Auto | `now` | |
| `updatedAt` | Date | Auto | `now` | |

**Indexes:**
- `user` — for "my orders" queries
- `createdAt: -1` — for admin dashboard (newest first)

### OrderItem (Embedded Subdocument)

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | String | Yes | Product name (snapshot) |
| `qty` | Number | Yes | Quantity (min 1) |
| `image` | String | No | Product image URL (snapshot) |
| `price` | Number | Yes | Price at purchase time |
| `product` | ObjectId → Product | Yes | Reference to product |

### ShippingAddress (Embedded Subdocument)

| Field | Type | Required |
|---|---|---|
| `address` | String | Yes |
| `city` | String | Yes |
| `postalCode` | String | Yes |
| `country` | String | Yes |

```javascript
// Example document
{
  _id: ObjectId("..."),
  user: ObjectId("..."),
  orderItems: [
    {
      name: "Wireless Headphones",
      qty: 2,
      image: "https://res.cloudinary.com/.../image.jpg",
      price: 299.99,
      product: ObjectId("...")
    }
  ],
  shippingAddress: {
    address: "123 Main St",
    city: "Mumbai",
    postalCode: "400001",
    country: "India"
  },
  paymentMethod: "COD",
  paymentResult: null,
  itemsPrice: 599.98,
  taxPrice: 48.00,
  shippingPrice: 0,
  totalPrice: 647.98,
  isPaid: false,
  paidAt: null,
  isDelivered: false,
  deliveredAt: null,
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

---

## Relationships Diagram

```
┌──────────┐       ┌──────────────┐       ┌──────────┐
│   User   │──1:N──│    Order     │──N:1──│  Product │
│          │       │              │       │          │
│ _id      │◄──────│ user         │       │ _id      │
│ name     │       │ orderItems[] │──────►│ name     │
│ email    │       │   .product ──┘       │ price    │
│ password │       │ shippingAddress      │ image    │
│ isAdmin  │       │ paymentMethod        │ category │
└──────────┘       │ totalPrice           │ rating   │
                   │ isPaid               │ reviews[]│
       │           │ isDelivered          └──────────┘
       │           └──────────────┘
       │
       └──1:N── Product.reviews[]
                (embedded, references User._id)
```

- **User → Order:** One user has many orders (`order.user` references `User._id`)
- **Product → OrderItem:** One product appears in many order items (`orderItem.product` references `Product._id`)
- **User → Review:** One user writes many reviews (embedded in `Product.reviews[]`, `review.user` references `User._id`)
