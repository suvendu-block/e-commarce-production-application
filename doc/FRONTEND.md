# Frontend Architecture

## Overview

React 19 SPA with Vite 8, Redux Toolkit for state, React Router 6 for routing, Tailwind CSS for styling.

## Folder Structure

```
frontend/src/
├── api/                 # API layer (Axios + Mock)
│   ├── axios.js         # Axios instance (base URL, auth interceptor)
│   ├── authApi.js       # Login, register, profile
│   ├── productApi.js    # CRUD + search
│   ├── orderApi.js      # Create, list, pay, deliver
│   ├── userApi.js       # Admin user management
│   ├── uploadApi.js     # Image upload
│   ├── mockData.js      # In-memory mock database
│   └── utils.js         # Mock helper utilities
├── components/
│   ├── layout/          # Header, Footer
│   ├── cart/            # CartItem, CartSummary
│   ├── admin/           # AdminSidebar, AdminHeader
│   └── ui/              # Button, Card, Input, PrivateRoute, AdminRoute, Loader
├── constants/
│   └── index.js         # API_BASE_URL, USE_MOCK, PAGE_SIZE, TAX_RATE, etc.
├── hooks/
│   └── useReveal.js     # Scroll reveal animation hook
├── pages/
│   ├── HomePage.jsx
│   ├── ProductPage.jsx
│   ├── CartPage.jsx
│   ├── auth/            # LoginPage, RegisterPage, ProfilePage
│   ├── checkout/        # ShippingPage, PaymentPage, PlaceOrderPage
│   ├── order/           # OrderPage
│   └── admin/           # AdminDashboardPage, ProductListPage, ProductEditPage, UserListPage, UserEditPage, OrderListPage
└── store/
    ├── index.js         # configureStore
    └── slices/          # auth, cart, product, order, user, upload
```

## Routing

All routes are lazy-loaded via `React.lazy()` + `Suspense`.

| Path | Component | Access |
|---|---|---|
| `/` | HomePage | Public |
| `/page/:pageNumber` | HomePage | Public |
| `/search/:keyword` | HomePage | Public |
| `/product/:id` | ProductPage | Public |
| `/cart` | CartPage | Public |
| `/login` | LoginPage | Guest |
| `/register` | RegisterPage | Guest |
| `/profile` | ProfilePage | Private |
| `/shipping` | ShippingPage | Private |
| `/payment` | PaymentPage | Private |
| `/placeorder` | PlaceOrderPage | Private |
| `/order/:id` | OrderPage | Private |
| `/admin` | AdminDashboardPage | Admin |
| `/admin/products` | ProductListPage | Admin |
| `/admin/product/:id/edit` | ProductEditPage | Admin |
| `/admin/product/new` | ProductEditPage | Admin |
| `/admin/users` | UserListPage | Admin |
| `/admin/user/:id/edit` | UserEditPage | Admin |
| `/admin/orders` | OrderListPage | Admin |
| `/admin/order/:id` | OrderPage | Admin |
| `*` | Redirect to `/` | — |

### Route Guards

- **PrivateRoute** — checks `auth.user !== null`; redirects to `/login` if not authenticated
- **AdminRoute** — checks `auth.user.isAdmin === true`; redirects to `/` if not admin

## Redux Store

### State Shape

```javascript
{
  auth: {
    user: { _id, name, email, isAdmin } | null,
    token: string | null,
    loading: boolean,
    error: string | null
  },
  cart: {
    cartItems: [{ product, name, image, price, countInStock, qty }],
    shippingAddress: { address, city, postalCode, country } | null,
    paymentMethod: 'COD'
  },
  product: {
    list: { products, page, pages, count, loading, error },
    detail: { product, loading, error },
    top: { products, loading, error },
    review: { loading, error, success },
    create: { product, loading, error, success },
    update: { product, loading, error, success },
    remove: { loading, error, success }
  },
  order: {
    create: { order, loading, success, error },
    detail: { order, loading, error },
    pay: { loading, success, error },
    deliver: { loading, success, error },
    myList: { orders, loading, error },
    list: { orders, loading, error }
  },
  user: {
    list: { users, loading, error },
    update: { user, loading, success, error },
    remove: { loading, success, error }
  },
  upload: {
    url, publicId, loading, error
  }
}
```

### Slice Actions & Thunks

**authSlice:**
- `login(email, password)` — POST /api/auth/login
- `register(name, email, password)` — POST /api/auth/register
- `fetchProfile()` — GET /api/auth/profile
- `updateProfile({ name, email, password })` — PUT /api/auth/profile
- `logout()` — clears localStorage + Redux state
- `clearError()` — resets error state

**cartSlice:**
- `addToCart({ product, qty })` — adds/updates item (caps at countInStock)
- `removeFromCart(productId)` — removes item
- `setQty({ productId, qty })` — updates quantity (clamps 1..countInStock)
- `saveShippingAddress(address)` — stores address
- `savePaymentMethod(method)` — stores payment method
- `clearCart()` — empties cart + localStorage

**productSlice:**
- `listProducts(params)` — GET /api/products
- `getProductDetails(id)` — GET /api/products/:id
- `getTopProducts()` — GET /api/products/top
- `createProductReview({ productId, rating, comment })` — POST /api/products/:id/reviews
- `createProduct(data)` — POST /api/products (admin)
- `updateProduct({ id, data })` — PUT /api/products/:id (admin)
- `deleteProduct(id)` — DELETE /api/products/:id (admin)

**orderSlice:**
- `createOrder({ orderItems, shippingAddress, paymentMethod })` — POST /api/orders
- `getOrderDetails(id)` — GET /api/orders/:id
- `payOrder({ id, paymentResult })` — PUT /api/orders/:id/pay
- `deliverOrder(id)` — PUT /api/orders/:id/deliver
- `getMyOrders()` — GET /api/orders/myorders
- `listOrders()` — GET /api/orders (admin)

**userSlice:**
- `listUsers()` — GET /api/users (admin)
- `updateUser({ id, data })` — PUT /api/users/:id (admin)
- `deleteUser(id)` — DELETE /api/users/:id (admin)

**uploadSlice:**
- `upload(file)` — POST /api/upload (admin)

### Persistence

- `auth.user` + `auth.token` → `localStorage` key `userInfo`
- `cart.cartItems` → `localStorage` key `cartItems`
- `cart.shippingAddress` → `localStorage` key `shippingAddress`
- `cart.paymentMethod` → `localStorage` key `paymentMethod`

## Mock System

When `VITE_USE_MOCK=true` (default):

1. Each `*Api.js` module checks `USE_MOCK` constant
2. If true, calls resolve to functions in `mockData.js`
3. `mockData.js` maintains an in-memory database (`dbUsers`, `dbProducts`, `dbOrders`)
4. `clone()` utility returns deep copies to prevent Immer freeze issues in Redux dev mode
5. Mock functions simulate network delay with `setTimeout`

### Mock Data

- **8 products** across Electronics, Clothing, Home & Kitchen, Books, Sports
- **2 users:** admin (admin@example.com / admin123), regular (john@example.com / john123)
- **Orders:** created dynamically when user places orders

### Switching to Live Mode

Set `VITE_USE_MOCK=false` in `frontend/.env` and ensure the backend is running at `VITE_API_URL`.

## UI Components

Built on Shadcn-style primitives (Radix UI + Tailwind):

- `Button` — variants: default, destructive, outline, secondary, ghost, link
- `Card`, `CardHeader`, `CardContent`, `CardTitle`, `CardDescription`
- `Input`, `Label`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`
- `Badge` — variants: default, secondary, destructive, outline
- `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`
- `Textarea`
- `Loader` — spinner with optional label

## Design System

- **Colors:** Warm charcoal (`#2D2A26`) primary, parchment background (`#FAF8F5`), gold accent (`#C9A96E`), success green, error red
- **Typography:** Inter Tight (headings/UI), Spectral (body/accent)
- **Spacing:** Tailwind defaults with `max-w-7xl mx-auto` containers
- **Animations:** Scroll reveal via `useReveal.js` hook
- **Responsive:** Mobile-first with `sm:`, `md:`, `lg:` breakpoints
