import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';

import userRoutes from '../routes/user.routes.js';
import { notFound, errorHandler } from '../middleware/error.middleware.js';
import User from '../models/user.model.js';

let mongoServer;
let app;
let request;

process.env.JWT_SECRET = 'test-jwt-secret';

const adminUser = { name: 'Admin', email: 'admin@example.com', password: 'password123', isAdmin: true };
const normalUser = { name: 'User', email: 'user@example.com', password: 'password123' };
const targetUser = { name: 'Target', email: 'target@example.com', password: 'password123' };
let adminToken;
let userToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Build a minimal app — same pattern as auth.test.js / product.test.js
  app = express();
  app.use(express.json());
  app.use('/api/users', userRoutes);
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

  const admin = await User.create(adminUser);
  const user = await User.create(normalUser);
  adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
});

// ─── GET /api/users ──────────────────────────────────

describe('GET /api/users', () => {
  it('returns all users to admin, without passwords', async () => {
    const res = await request.get('/api/users').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].password).toBeUndefined();
  });

  it('returns 403 for non-admin user', async () => {
    const res = await request.get('/api/users').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('returns 401 without token', async () => {
    const res = await request.get('/api/users');
    expect(res.status).toBe(401);
  });
});

// ─── GET /api/users/:id ──────────────────────────────

describe('GET /api/users/:id', () => {
  it('returns a single user to admin', async () => {
    const user = await User.create(targetUser);

    const res = await request.get(`/api/users/${user._id}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(targetUser.email);
    expect(res.body.password).toBeUndefined();
  });

  it('returns 404 for non-existent user', async () => {
    const res = await request.get('/api/users/000000000000000000000000').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('returns 403 for non-admin user', async () => {
    const user = await User.create(targetUser);

    const res = await request.get(`/api/users/${user._id}`).set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
});

// ─── PUT /api/users/:id ──────────────────────────────

describe('PUT /api/users/:id', () => {
  it('updates a user name and email as admin', async () => {
    const user = await User.create(targetUser);

    const res = await request
      .put(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Name', email: 'updated@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Name');
    expect(res.body.email).toBe('updated@example.com');
    expect(res.body.isAdmin).toBe(false);
  });

  it('promotes a user to admin via isAdmin flag', async () => {
    const user = await User.create(targetUser);

    const res = await request
      .put(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isAdmin: true });

    expect(res.status).toBe(200);
    expect(res.body.isAdmin).toBe(true);
  });

  it('returns 404 for non-existent user', async () => {
    const res = await request
      .put('/api/users/000000000000000000000000')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Xavier' });
    expect(res.status).toBe(404);
  });

  it('returns 400 when body is empty (Joi .min(1))', async () => {
    const user = await User.create(targetUser);

    const res = await request
      .put(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('returns 400 with invalid email format', async () => {
    const user = await User.create(targetUser);

    const res = await request
      .put(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'not-valid' });
    expect(res.status).toBe(400);
  });

  it('returns 403 for non-admin user', async () => {
    const user = await User.create(targetUser);

    const res = await request
      .put(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'X' });
    expect(res.status).toBe(403);
  });
});

// ─── DELETE /api/users/:id ───────────────────────────

describe('DELETE /api/users/:id', () => {
  it('deletes a user as admin', async () => {
    const user = await User.create(targetUser);

    const res = await request
      .delete(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(await User.findById(user._id)).toBeNull();
  });

  it('returns 404 for non-existent user', async () => {
    const res = await request
      .delete('/api/users/000000000000000000000000')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('returns 403 for non-admin user', async () => {
    const user = await User.create(targetUser);

    const res = await request
      .delete(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
});
