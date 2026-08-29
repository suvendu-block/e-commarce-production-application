# Deployment Guide

## Overview

- **Frontend:** Vercel (static SPA)
- **Backend:** Render (Node.js service)
- **Database:** MongoDB Atlas (free tier)
- **Cache/Queue:** Upstash Redis (free tier) or Render Redis
- **Image Uploads:** Cloudinary (free tier)

---

## Frontend (Vercel)

### Setup

1. Connect GitHub repo to Vercel
2. Framework: **Vite**
3. Root directory: `frontend`
4. Build command: `npm run build`
5. Output directory: `dist`

### Environment Variables

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-backend.onrender.com/api` |
| `VITE_USE_MOCK` | `false` |

### SPA Rewrites

Vercel automatically handles SPA rewrites for React Router. No configuration needed — the `/*` catch-all route in `App.jsx` handles 404s.

### Build Optimization

- Vite code-splits at route level via `React.lazy()`
- Only `HomePage` and `Header`/`Footer` ship in the initial bundle
- Admin and checkout pages load on demand

---

## Backend (Render)

### Setup

1. Connect GitHub repo to Render
2. Environment: **Node**
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Health check path: `/` (or add a dedicated `/health` endpoint)

### Environment Variables

| Variable | Value |
|---|---|
| `PORT` | `10000` (or leave unset — Render assigns one) |
| `MONGO_URI` | `mongodb+srv://...` (Atlas connection string) |
| `JWT_SECRET` | `<strong-random-string>` |
| `REDIS_URL` | `redis://...` (Upstash or Render Redis URL) |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
| `CLOUDINARY_URL` | `cloudinary://key:secret@cloud_name` |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASS` | Your Gmail app password |
| `EMAIL_FROM` | `E-Commerce <your@gmail.com>` |

### Important Notes

- Render free tier spins down after 15 min of inactivity — first request may take 30-60s
- Set `NODE_ENV=production` for stack traces to be hidden

---

## Database (MongoDB Atlas)

### Free Tier Setup

1. Create account at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a M0 cluster (free, 512MB storage)
3. Create database user (Database Access)
4. Whitelist IP addresses (Network Access) — add `0.0.0.0/0` for Render
5. Get connection string: `mongodb+srv://<user>:<pass>@cluster.mongodb.net/`

### Collections (auto-created by Mongoose)

- `users`
- `products`
- `orders`

---

## Redis (Upstash)

### Free Tier Setup

1. Create account at [upstash.com](https://upstash.com)
2. Create a Redis database
3. Copy the `REDIS_URL` from the dashboard
4. Used for: Bull queues (email + inventory) and rate limiting

### Alternative: Render Redis

- Add Redis addon in Render dashboard
- Use the internal connection string

---

## CI/CD (GitHub Actions)

Pipeline runs on push/PR to `main`:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js 22
      - Install backend dependencies (npm ci)
      - Run backend tests (npm test)
      - Upload test report on failure
```

**Note:** Only backend tests run in CI. Frontend tests are not yet in the pipeline.

---

## Deployment Checklist

### Before Deploying

- [ ] All tests pass locally (`npm test` in backend)
- [ ] Frontend builds without errors (`npm run build` in frontend)
- [ ] Environment variables set in Vercel (frontend)
- [ ] Environment variables set in Render (backend)
- [ ] MongoDB Atlas IP whitelist includes Render
- [ ] Redis URL is valid (no `redis-cli -u` prefix)

### Post-Deploy

- [ ] Test login/register flow
- [ ] Test product listing and search
- [ ] Test order placement
- [ ] Test admin dashboard
- [ ] Test image upload (admin)
- [ ] Check email delivery (order confirmation)

---

## Live URLs

| Service | URL |
|---|---|
| Frontend | `https://e-commarce-production-application.vercel.app/` |
| Backend | `https://your-backend.onrender.com/api` |
| MongoDB | Atlas dashboard |
| Redis | Upstash dashboard |
| Cloudinary | Cloudinary dashboard |
