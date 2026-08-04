# E-Commerce Full-Stack Application

Live Demo: https://e-commarce-production-application.vercel.app/

A full-stack e-commerce web application built with a Node.js/Express backend and a React + Vite frontend. The project includes customer shopping flows, JWT authentication, admin dashboard tools, Redis-based rate limiting, cloud image uploads, background email processing, and order management.

## Live Demo

The application is deployed and running at:

- https://e-commarce-production-application.vercel.app/

Use the demo credentials below to test the storefront and admin area:

- Admin: admin@example.com / admin123
- Customer: john@example.com / john123

## Overview

This app is designed as a modern online store where users can:

- browse products and search/filter by category or price
- add items to a cart and proceed through checkout
- register and log in securely with JWT
- view profile information and order history
- leave product reviews
- manage admin tasks such as product, user, and order management

The backend provides a REST API for all storefront and admin logic, while the frontend consumes the API through Redux-powered state management and React Router pages.

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- Redis (rate limiting and queue support)
- JWT for authentication
- Joi for request validation
- Bull for background jobs
- Cloudinary for image uploads
- Nodemailer for order email notifications
- Jest + Supertest for API testing

### Frontend

- React 19
- Vite
- Redux Toolkit
- React Router DOM
- Axios
- Tailwind CSS
- React Hook Form + Zod
- React Helmet Async

## Project Structure

```bash
.
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── service/
│   ├── tests/
│   ├── validators/
│   ├── utils/
│   ├── .env
│   ├── docker-compose.yml
│   ├── index.js
│   ├── package.json
│   ├── seed.js
│   ├── server.js
│   └── TEST-COMMANDS.md
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .env
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── readme.md
└── LICENSE (if present in your repo)
```

## Features

### Customer Features

- Product listing with pagination and search
- Category and price-based filtering
- Product detail pages with ratings and reviews
- Shopping cart with quantity updates
- Checkout flow with shipping and payment selection
- Order placement and order details
- User profile management
- Password-protected JWT authentication

### Admin Features

- Product creation, editing, and deletion
- User management
- Order list and status updates
- Role-based admin access control
- Product image upload support

### Security and Reliability

- Protected routes with JWT middleware
- Role-based access checks for admin routes
- Input validation via Joi schemas
- Redis-based request rate limiting
- Centralized error handling
- Background job processing for emails and inventory related tasks

## Default Demo Accounts

The app comes with seed data for testing.

- Admin:
  - Email: admin@example.com
  - Password: admin123

- Customer:
  - Email: john@example.com
  - Password: john123

## Environment Setup

### Backend Environment

Create a `.env` file inside `backend/` with the following variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_super_secret_key
REDIS_URL=redis://localhost:6379
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
NODE_ENV=development
```

> If you are using MongoDB Atlas, set `MONGO_URI` to your Atlas connection string instead of the local MongoDB URL.

### Frontend Environment

Create a `.env` file inside `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_USE_MOCK=false
```

## Running the Project

### 1. Start MongoDB and Redis

From the `backend` folder:

```bash
docker compose up -d
```

This starts:

- MongoDB on port `27017`
- Redis on port `6379`

### 2. Install dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

### 3. Seed the database

```bash
cd backend
npm run seed
```

This creates demo users and sample products.

### 4. Start the backend

```bash
cd backend
npm run dev
```

The backend runs on:

- http://localhost:5000

### 5. Start the frontend

```bash
cd frontend
npm run dev
```

The frontend runs on:

- http://localhost:5173

## Backend API Highlights

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`

### Products

- `GET /api/products`
- `GET /api/products/top`
- `GET /api/products/:id`
- `POST /api/products` (admin only)
- `PUT /api/products/:id` (admin only)
- `DELETE /api/products/:id` (admin only)
- `POST /api/products/:id/reviews`

### Orders

- `POST /api/orders`
- `GET /api/orders/myorders`
- `GET /api/orders/:id`
- `PUT /api/orders/:id/pay`
- `GET /api/orders` (admin only)
- `PUT /api/orders/:id/deliver` (admin only)

### Users

- `GET /api/users` (admin only)
- `GET /api/users/:id` (admin only)
- `PUT /api/users/:id` (admin only)
- `DELETE /api/users/:id` (admin only)

### Uploads

- `POST /api/upload` (admin only)

## Scripts

### Backend scripts

```bash
npm run dev
npm run start
npm run seed
npm test
npm run test:email
```

### Frontend scripts

```bash
npm run dev
npm run build
npm run preview
npm test
npm run lint
```

## Testing

The backend includes Jest tests covering:

- authentication
- products
- orders
- user roles
- rate limiting
- upload validation

Run the backend tests with:

```bash
cd backend
npm test
```

The frontend also includes test files for utility functions and UI safety checks.

## Notes

- The project is built to work with either local MongoDB/Redis or cloud deployment settings.
- The admin and customer flows are separated using route guards and middleware.
- Redis is used for rate limiting and queue-based background work.
- Cloudinary is configured for product image uploads.
- Email notifications are sent through the queue system after order placement.

## License

This project is currently intended for educational and personal project use. If you plan to distribute it publicly, add an appropriate license file and set the license in the package configuration.

## Summary

This application is a complete full-stack e-commerce solution with:

- robust backend API
- secure authentication and authorization
- storefront UI and admin dashboard
- MongoDB-based data model
- Redis-backed request protection
- image upload and email workflows

It is ready for further extension into a production-quality store with features such as Stripe integration, product search optimization, analytics, and deployment automation.
