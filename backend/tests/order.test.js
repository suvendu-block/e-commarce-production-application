import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';

import orderRoutes from '../routes/order.routes.js';
import { notFound, errorHandler } from '../middleware/error.middleware.js';
import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';

let mongoServer;
let app;
let request;

process.env.JWT_SECRET = 'test-jwt-secret';

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
const shippingAddress = { address: '123 Main St', city: 'Springfield', postalCode: '12345', country: 'USA' };
let adminToken;
let userToken;
let otherToken;

// Creates a bare-bones order doc directly in the DB (bypasses the API)
const createOrderInDb = async (userId, overrides = {}) =>
  Order.create({
    user: userId,
    orderItems: [],
    shippingAddress,
    paymentMethod: 'COD',
    itemsPrice: 10,
    taxPrice: 0.8,
    shippingPrice: 10,
    totalPrice: 20.8,
    ...overrides,
  });

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Build a minimal app — same pattern as auth.test.js / product.test.js
  app = express();
  app.use(express.json());
  app.use('/api/orders', orderRoutes);
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
  await Order.deleteMany({});

  const admin = await User.create(adminUser);
  const user = await User.create(normalUser);
  const other = await User.create({ name: 'Other', email: 'other@example.com', password: 'password123' });
  adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  otherToken = jwt.sign({ id: other._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
});

// ─── POST /api/orders ──────────────────────────────────

describe('POST /api/orders', () => {
  it('creates an order, computes totals server-side, and decrements stock', async () => {
    const product = await Product.create(sampleProduct);

    const res = await request
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ orderItems: [{ product: product._id, qty: 2 }], shippingAddress, paymentMethod: 'COD' });

    expect(res.status).toBe(201);
    expect(res.body.itemsPrice).toBe(999.98); // 499.99 * 2
    expect(res.body.taxPrice).toBe(80.0); // 8% of items
    expect(res.body.shippingPrice).toBe(0); // free over $100
    expect(res.body.totalPrice).toBe(1079.98);
    expect(res.body.paymentMethod).toBe('COD');
    expect(res.body.orderItems[0].name).toBe(sampleProduct.name);

    const updated = await Product.findById(product._id);
    expect(updated.countInStock).toBe(8); // 10 - 2
  });

  it('returns 400 for empty cart', async () => {
    const res = await request
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ orderItems: [], shippingAddress, paymentMethod: 'COD' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for unknown product', async () => {
    const res = await request
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        orderItems: [{ product: '000000000000000000000000', qty: 1 }],
        shippingAddress,
        paymentMethod: 'COD',
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('One or more products not found');
  });

  it('returns 400 when stock is insufficient', async () => {
    const product = await Product.create(sampleProduct);

    const res = await request
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        orderItems: [{ product: product._id, qty: 12 }],
        shippingAddress,
        paymentMethod: 'COD',
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Insufficient stock');
  });

  it('returns 401 without token', async () => {
    const product = await Product.create(sampleProduct);

    const res = await request
      .post('/api/orders')
      .send({ orderItems: [{ product: product._id, qty: 1 }], shippingAddress, paymentMethod: 'COD' });
    expect(res.status).toBe(401);
  });
});

// ─── GET /api/orders/myorders ──────────────────────────

describe('GET /api/orders/myorders', () => {
  it('returns only the logged-in user\'s orders', async () => {
    const user = await User.findOne({ email: normalUser.email });
    const other = await User.findOne({ email: 'other@example.com' });

    await createOrderInDb(user._id);
    await createOrderInDb(other._id);

    const res = await request.get('/api/orders/myorders').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].user.toString()).toBe(user._id.toString());
  });
});

// ─── GET /api/orders/:id ───────────────────────────────

describe('GET /api/orders/:id', () => {
  it('returns order to its owner', async () => {
    const user = await User.findOne({ email: normalUser.email });
    const order = await createOrderInDb(user._id);

    const res = await request.get(`/api/orders/${order._id}`).set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body._id.toString()).toBe(order._id.toString());
  });

  it('returns 403 to a different user', async () => {
    const user = await User.findOne({ email: normalUser.email });
    const order = await createOrderInDb(user._id);

    const res = await request.get(`/api/orders/${order._id}`).set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
  });

  it('allows admin to view any order', async () => {
    const user = await User.findOne({ email: normalUser.email });
    const order = await createOrderInDb(user._id);

    const res = await request.get(`/api/orders/${order._id}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('returns 404 for non-existent order', async () => {
    const res = await request.get('/api/orders/000000000000000000000000').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});

// ─── PUT /api/orders/:id/pay ───────────────────────────

describe('PUT /api/orders/:id/pay', () => {
  it('marks the order as paid', async () => {
    const user = await User.findOne({ email: normalUser.email });
    const order = await createOrderInDb(user._id);

    const res = await request
      .put(`/api/orders/${order._id}/pay`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ paymentResult: { id: 'pay_123', status: 'completed' } });

    expect(res.status).toBe(200);
    expect(res.body.isPaid).toBe(true);
    expect(res.body.paidAt).toBeDefined();
    expect(res.body.paymentResult.status).toBe('completed');
  });
});

// ─── PUT /api/orders/:id/deliver ───────────────────────

describe('PUT /api/orders/:id/deliver', () => {
  it('marks the order as delivered (admin)', async () => {
    const user = await User.findOne({ email: normalUser.email });
    const order = await createOrderInDb(user._id);

    const res = await request
      .put(`/api/orders/${order._id}/deliver`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.isDelivered).toBe(true);
    expect(res.body.deliveredAt).toBeDefined();
  });

  it('returns 403 for non-admin', async () => {
    const user = await User.findOne({ email: normalUser.email });
    const order = await createOrderInDb(user._id);

    const res = await request
      .put(`/api/orders/${order._id}/deliver`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
});

// ─── GET /api/orders (admin) ───────────────────────────

describe('GET /api/orders', () => {
  it('returns all orders to admin, newest first', async () => {
    const user = await User.findOne({ email: normalUser.email });
    const first = await createOrderInDb(user._id);
    const second = await createOrderInDb(user._id, { itemsPrice: 20, taxPrice: 1.6, totalPrice: 31.6 });

    const res = await request.get('/api/orders').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]._id.toString()).toBe(second._id.toString());
    expect(res.body[1]._id.toString()).toBe(first._id.toString());
  });

  it('returns 403 for non-admin', async () => {
    const res = await request.get('/api/orders').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
});
