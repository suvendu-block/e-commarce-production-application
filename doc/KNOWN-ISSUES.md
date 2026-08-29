# Known Issues & TODOs

## Critical Bugs

### 1. REDIS_URL Has Invalid Prefix

**File:** `backend/.env:23`  
**Status:** Known, not fixed  
**Impact:** Email sending and Bull queues fail silently

The `REDIS_URL` in `.env` contains a `redis-cli -u` prefix that makes it invalid for Bull and ioredis:

```
REDIS_URL=redis-cli -u redis://database-MT5BLJUJ:default:3PXW4ZbUwYCGYc9GI0blr9l5a5VlAaGW@aquamarine-pump-theory-64579.db.redis.io:12460
```

**Fix:** Remove the `redis-cli -u ` prefix:

```
REDIS_URL=redis://database-MT5BLJUJ:default:3PXW4ZbUwYCGYc9GI0blr9l5a5VlAaGW@aquamarine-pump-theory-64579.db.redis.io:12460
```

**Workaround:** The rate limiter fails open (requests pass through). Bull queue jobs silently fail.

---

### 2. Immer Freeze Bug in Mock Orders (Fixed)

**File:** `frontend/src/api/orderApi.js`  
**Status:** Fixed  
**Impact:** "Mark as paid" and "Mark as delivered" buttons crashed in mock mode

**Root cause:** `mockMyOrders` returned live references from `dbOrders`. When Redux Toolkit/Immer deeply freezes state in dev mode, these live objects became permanently frozen. `Object.assign(order, { isPaid: true })` then failed with `Cannot assign to read only property 'isPaid'`.

**Fix:** Added `.map(clone)` to `mockMyOrders`, `{ ...clone(order), userName }` to `mockAllOrders`, and `clone(order)` to `mockOrderById`.

---

## Security Issues

### 3. No Admin Route Guard on Frontend

**Status:** Known, not fixed  
**Impact:** Non-admin users can access admin pages by navigating to `/admin` directly

The `AdminRoute` component checks `auth.user.isAdmin`, but there's no server-side middleware on the frontend route definitions. A user could manually navigate to `/admin` and see the admin layout before the check redirects them.

**Fix:** Add `AdminRoute` check as early as possible, or add a loading state that prevents flash of admin content.

### 4. No Google OAuth Scopes

**Status:** Not implemented  
**Impact:** N/A (Google OAuth not yet integrated)

### 5. JWT Has No Expiry

**Status:** Known  
**Impact:** Tokens never expire unless user logs out

The JWT is generated without an `expiresIn` option. Tokens remain valid indefinitely. Compromised tokens can't be revoked.

**Fix:** Add `expiresIn: '7d'` to `jwt.sign()` and implement refresh token flow.

### 6. No HTTP-Only Cookies

**Status:** Known  
**Impact:** JWT stored in localStorage is vulnerable to XSS attacks

**Fix:** Use HTTP-only cookies for token storage instead of localStorage.

---

## Email System Issues

### 7. Email Service Not Working End-to-End

**Status:** Blocked by REDIS_URL issue  
**Impact:** Order confirmation emails not sent

**Dependencies:**
1. REDIS_URL must be fixed (Issue #1)
2. Gmail app password must be valid
3. Backend must be running with Redis connected

### 8. No Email Templates

**Status:** Not implemented  
**Impact:** Emails are plain HTML strings in code

The email HTML is hardcoded in `email.service.js`. No template engine, no responsive email design.

### 9. No Email Retry Logic

**Status:** Not implemented  
**Impact:** If email fails, it's logged and forgotten

Bull queue retries the job 3 times with 5s backoff, but if all retries fail, the email is lost. No dead letter queue, no admin notification.

---

## Frontend Issues

### 10. No Error Boundaries

**Status:** Not implemented  
**Impact:** Unhandled errors crash the entire React tree

No `ErrorBoundary` components to catch rendering errors gracefully.

### 11. No Form Dirty State Handling

**Status:** Not implemented  
**Impact:** Users can navigate away from forms with unsaved changes

Forms don't warn about unsaved changes when navigating away.

### 12. No Input Masking

**Status:** Not implemented  
**Impact:** Phone numbers, postal codes, etc. have no format enforcement

### 13. No SEO Meta Tags

**Status:** Partial  
**Impact:** Dynamic meta tags for product pages not set

`react-helmet-async` is installed but meta tags are minimal. No Open Graph tags, no structured data.

---

## Backend Issues

### 14. No Smoke Tests

**Status:** Not implemented  
**Impact:** No quick health check for deployment verification

### 15. No Health Check Endpoint

**Status:** Not implemented  
**Impact:** Render can't verify service health

**Fix:** Add `GET /health` that returns `200 OK`.

### 16. No Request Logging

**Status:** Not implemented  
**Impact:** No visibility into API usage in production

No Morgan or Pino for request/response logging.

### 17. No API Versioning

**Status:** Not implemented  
**Impact:** Breaking changes affect all clients

All routes are under `/api/` with no version prefix (e.g., `/api/v1/`).

### 18. No Pagination Limits

**Status:** Known  
**Impact:** Clients can request `limit=10000` and overwhelm the server

The `limit` query parameter has no maximum cap.

---

## Testing Gaps

### 19. Frontend Tests Not in CI

**Status:** Not implemented  
**Impact:** Frontend regressions not caught in CI pipeline

Only backend tests run in GitHub Actions. Frontend tests (`vitest run`) should be added.

### 20. No Integration Tests

**Status:** Not implemented  
**Impact:** End-to-end flows not tested

All tests are unit/integration tests. No Playwright or Cypress for full E2E testing.

---

## Scalability Concerns

### 21. In-Memory Mock Data Doesn't Persist

**Status:** By design  
**Impact:** Data resets on page refresh in mock mode

### 22. No Caching Layer

**Status:** Not implemented  
**Impact:** Every request hits MongoDB

No Redis caching for frequently accessed data (product listings, top products).

### 23. No Rate Limiting on All Routes

**Status:** Known  
**Impact:** Only auth routes are rate-limited

The rate limiter is applied only to auth routes. Product, order, and user routes have no rate limiting.

---

## Priority Order

1. Fix REDIS_URL (Issue #1) — unblocks email
2. Add JWT expiry (Issue #5) — security
3. Add health check endpoint (Issue #15) — deployment
4. Add frontend tests to CI (Issue #19) — quality
5. Add error boundaries (Issue #10) — stability
6. Add rate limiting to all routes (Issue #23) — security
