import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';

import productRoutes from '../routes/product.routes.js';
import { notFound, errorHandler } from '../middleware/error.middleware.js';
import User from '../models/user.model.js';
import Product from '../models/product.model.js';

let mongoServer;
let app;
let request;

process.env.JWT_SECRET = 'test-jwt-secret';

// One admin + one regular user — exercises the admin middleware on CRUD routes
const adminUser = { name: 'Admin', email: 'admin@example.com', password: 'password123', isAdmin: true };
const normalUser = { name: 'User', email: 'user@example.com', password: 'password123' };
const sampleProduct = {
  name: 'Test Phone',
  price: 499.99,
  description: 'A great phone',
  image: 'https://example.com/phone.jpg',
  brand: 'TestBrand',
  category: 'Electronics',
  countInStock: 10,
};
let adminToken;
let userToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Build a minimal app — same pattern as auth.test.js
  app = express();
  app.use(express.json());
  app.use('/api/products', productRoutes);
  app.use(notFound);
  app.use(errorHandler);

  request = supertest(app);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Fresh DB + fresh tokens for every test
beforeEach(async () => {
  await User.deleteMany({});
  await Product.deleteMany({});

  const admin = await User.create(adminUser);
  const user = await User.create(normalUser);
  adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
});

// ─── GET /api/products ──────────────────────────────────

describe('GET /api/products', () => {
  it('returns empty list when no products', async () => {
    const res = await request.get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.products).toEqual([]);
  });

  it('returns products with pagination metadata', async () => {
    await Product.create({ ...sampleProduct, name: 'Phone A' });
    await Product.create({ ...sampleProduct, name: 'Phone B' });

    const res = await request.get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(2);
    expect(res.body.page).toBe(1);
    expect(res.body.pages).toBe(1);
    expect(res.body.count).toBe(2);
  });

  it('searches by keyword', async () => {
    await Product.create({ ...sampleProduct, name: 'iPhone 15' });
    await Product.create({ ...sampleProduct, name: 'Galaxy S24' });

    const res = await request.get('/api/products').query({ keyword: 'iphone' });
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].name).toBe('iPhone 15');
  });

  it('filters by category', async () => {
    await Product.create({ ...sampleProduct, category: 'Electronics' });
    await Product.create({ ...sampleProduct, name: 'Sofa', category: 'Furniture' });

    const res = await request.get('/api/products').query({ category: 'Furniture' });
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].name).toBe('Sofa');
  });

  it('paginates correctly', async () => {
    for (let i = 1; i <= 12; i++) {
      await Product.create({ ...sampleProduct, name: `Product ${i}` });
    }

    const res = await request.get('/api/products').query({ page: 2, pageSize: 10 });
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(2);
    expect(res.body.page).toBe(2);
    expect(res.body.pages).toBe(2);
  });
});

// ─── GET /api/products/top ──────────────────────────────

describe('GET /api/products/top', () => {
  it('returns top 5 rated products', async () => {
    for (let i = 1; i <= 6; i++) {
      await Product.create({ ...sampleProduct, name: `Product ${i}`, rating: i });
    }

    const res = await request.get('/api/products/top');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(5);
    expect(res.body[0].name).toBe('Product 6');
  });
});

// ─── GET /api/products/:id ──────────────────────────────

describe('GET /api/products/:id', () => {
  it('returns product by id', async () => {
    const product = await Product.create(sampleProduct);

    const res = await request.get(`/api/products/${product._id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe(sampleProduct.name);
  });

  it('returns 404 for invalid ObjectId', async () => {
    const res = await request.get('/api/products/invalid-id');
    expect(res.status).toBe(404);
  });

  it('returns 404 for non-existent product', async () => {
    const res = await request.get('/api/products/000000000000000000000000');
    expect(res.status).toBe(404);
  });
});

// ─── POST /api/products (admin) ─────────────────────────

describe('POST /api/products', () => {
  it('creates a product as admin', async () => {
    const res = await request
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(sampleProduct);

    expect(res.status).toBe(201);
    expect(res.body.name).toBe(sampleProduct.name);
    expect(res.body.slug).toBe('test-phone');
  });

  it('returns 403 for non-admin user', async () => {
    const res = await request
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send(sampleProduct);
    expect(res.status).toBe(403);
  });

  it('returns 401 without token', async () => {
    const res = await request.post('/api/products').send(sampleProduct);
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid body', async () => {
    const res = await request
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'X' });
    expect(res.status).toBe(400);
  });
});

// ─── PUT /api/products/:id (admin) ──────────────────────

describe('PUT /api/products/:id', () => {
  it('updates a product as admin', async () => {
    const product = await Product.create(sampleProduct);

    const res = await request
      .put(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 599.99 });

    expect(res.status).toBe(200);
    expect(res.body.price).toBe(599.99);
  });

  it('returns 403 for non-admin user', async () => {
    const product = await Product.create(sampleProduct);

    const res = await request
      .put(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ price: 1 });
    expect(res.status).toBe(403);
  });

  it('returns 404 for non-existent product', async () => {
    const res = await request
      .put('/api/products/000000000000000000000000')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 1 });
    expect(res.status).toBe(404);
  });
});

// ─── DELETE /api/products/:id (admin) ───────────────────

describe('DELETE /api/products/:id', () => {
  it('deletes a product as admin', async () => {
    const product = await Product.create(sampleProduct);

    const res = await request
      .delete(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(await Product.findById(product._id)).toBeNull();
  });

  it('returns 403 for non-admin user', async () => {
    const product = await Product.create(sampleProduct);

    const res = await request
      .delete(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
});

// ─── POST /api/products/:id/reviews ─────────────────────

describe('POST /api/products/:id/reviews', () => {
  it('adds a review and updates rating', async () => {
    const product = await Product.create(sampleProduct);

    const res = await request
      .post(`/api/products/${product._id}/reviews`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 5, comment: 'Great product' });

    expect(res.status).toBe(201);

    const updated = await Product.findById(product._id);
    expect(updated.numReviews).toBe(1);
    expect(updated.rating).toBe(5);
    expect(updated.reviews[0].name).toBe(normalUser.name);
  });

  it('returns 400 for duplicate review by same user', async () => {
    const product = await Product.create(sampleProduct);
    const reviewBody = { rating: 5, comment: 'Great product' };

    await request
      .post(`/api/products/${product._id}/reviews`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(reviewBody);

    const res = await request
      .post(`/api/products/${product._id}/reviews`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(reviewBody);

    expect(res.status).toBe(400);
  });

  it('returns 401 without token', async () => {
    const product = await Product.create(sampleProduct);

    const res = await request
      .post(`/api/products/${product._id}/reviews`)
      .send({ rating: 5, comment: 'Great product' });
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid rating', async () => {
    const product = await Product.create(sampleProduct);

    const res = await request
      .post(`/api/products/${product._id}/reviews`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 6, comment: 'Great product' });
    expect(res.status).toBe(400);
  });
});
