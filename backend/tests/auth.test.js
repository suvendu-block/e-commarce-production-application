import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';

import authRoutes from '../routes/auth.routes.js';
import { notFound, errorHandler } from '../middleware/error.middleware.js';
import User from '../models/user.model.js';

let mongoServer;
let app;
let request;

process.env.JWT_SECRET = 'test-jwt-secret';
const JWT_SECRET = process.env.JWT_SECRET;

// Shared user data for login/profile tests
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
};
let userToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use(notFound);
  app.use(errorHandler);

  request = supertest(app);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

// ─── 404 ───────────────────────────────────────────────────

describe('404 — unknown routes', () => {
  it('returns 404 for unknown endpoint', async () => {
    const res = await request.get('/api/unknown');
    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Not found');
  });
});

// ─── POST /api/auth/register ──────────────────────────────

describe('POST /api/auth/register', () => {
  it('registers a new user and returns a token', async () => {
    const res = await request.post('/api/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: testUser.name,
      email: testUser.email,
      isAdmin: false,
    });
    expect(res.body._id).toBeDefined();
    expect(res.body.token).toBeDefined();

    const decoded = jwt.verify(res.body.token, JWT_SECRET);
    expect(decoded.id).toBe(res.body._id);

    const dbUser = await User.findById(res.body._id);
    expect(dbUser).not.toBeNull();
    expect(dbUser.password).not.toBe(testUser.password); // hashed
  });

  it('returns 400 when email already exists', async () => {
    await User.create(testUser);

    const res = await request.post('/api/auth/register').send(testUser);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('User already exists');
  });

  it('returns 400 when name is missing', async () => {
    const res = await request.post('/api/auth/register').send({
      email: 'x@y.com',
      password: '123456',
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 when email is invalid', async () => {
    const res = await request.post('/api/auth/register').send({
      name: 'X',
      email: 'not-an-email',
      password: '123456',
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is too short', async () => {
    const res = await request.post('/api/auth/register').send({
      name: 'X',
      email: 'x@y.com',
      password: '123',
    });
    expect(res.status).toBe(400);
  });
});

// ─── POST /api/auth/login ─────────────────────────────────

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await User.create(testUser);
  });

  it('logs in with valid credentials and returns a token', async () => {
    const res = await request.post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      name: testUser.name,
      email: testUser.email,
    });
    expect(res.body.token).toBeDefined();
    userToken = res.body.token;
  });

  it('returns 401 with wrong password', async () => {
    const res = await request.post('/api/auth/login').send({
      email: testUser.email,
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 for non-existent user', async () => {
    const res = await request.post('/api/auth/login').send({
      email: 'nonexistent@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(401);
  });

  it('returns 400 when email is missing (Joi validation)', async () => {
    const res = await request.post('/api/auth/login').send({
      password: 'password123',
    });
    expect(res.status).toBe(400);
  });
});

// ─── GET /api/auth/profile ────────────────────────────────

describe('GET /api/auth/profile', () => {
  beforeEach(async () => {
    const user = await User.create(testUser);
    userToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
  });

  it('returns the authenticated user profile', async () => {
    const res = await request
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      name: testUser.name,
      email: testUser.email,
      isAdmin: false,
    });
    expect(res.body.password).toBeUndefined();
  });

  it('returns 401 without Authorization header', async () => {
    const res = await request.get('/api/auth/profile');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Not authorized, no token');
  });

  it('returns 401 with malformed token', async () => {
    const res = await request
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer not-a-valid-token');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Not authorized, token failed');
  });

  it('returns 401 with expired token', async () => {
    const expired = jwt.sign({ id: '000000000000000000000000' }, JWT_SECRET, { expiresIn: '0s' });
    const res = await request
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });
});

// ─── PUT /api/auth/profile ─────────────────────────────────

describe('PUT /api/auth/profile', () => {
  beforeEach(async () => {
    const user = await User.create(testUser);
    userToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
  });

  it('updates the user name', async () => {
    const res = await request
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Updated Name' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Name');
    expect(res.body.email).toBe(testUser.email);
  });

  it('updates the user email', async () => {
    const res = await request
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ email: 'updated@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('updated@example.com');
  });

  it('updates the password and returns a new token', async () => {
    const res = await request
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ password: 'newpassword456' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();

    // Verify new password works
    const loginRes = await request.post('/api/auth/login').send({
      email: testUser.email,
      password: 'newpassword456',
    });
    expect(loginRes.status).toBe(200);
  });

  it('returns 400 when body is empty (Joi .min(1))', async () => {
    const res = await request
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('returns 401 without token', async () => {
    const res = await request
      .put('/api/auth/profile')
      .send({ name: 'X' });
    expect(res.status).toBe(401);
  });

  it('returns 400 with invalid email format', async () => {
    const res = await request
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ email: 'not-valid' });
    expect(res.status).toBe(400);
  });
});

// ─── Password hashing via User model ──────────────────────

describe('User model — password hashing', () => {
  it('hashes password before saving', async () => {
    const user = await User.create({
      name: 'Hash Test',
      email: 'hash@test.com',
      password: 'plaintext',
    });

    expect(user.password).not.toBe('plaintext');
    expect(user.password).toMatch(/^\$2[aby]\$\d{2}\$/); // bcrypt pattern
  });

  it('matchPassword returns true for correct password', async () => {
    const user = await User.create({
      name: 'Match Test',
      email: 'match@test.com',
      password: 'mypassword',
    });

    expect(await user.matchPassword('mypassword')).toBe(true);
    expect(await user.matchPassword('wrong')).toBe(false);
  });
});
