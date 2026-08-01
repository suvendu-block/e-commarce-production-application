import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';

// Mock ioredis — the rate limiter reads the zcard result from pipeline.exec().
// Native-ESM jest: unstable_mockModule + dynamic imports only.
const redisState = { count: 1, fail: false };

jest.unstable_mockModule('ioredis', () => {
  class MockRedis {
    on() {}
    pipeline() {
      const chain = {
        zremrangebyscore: () => chain,
        zadd: () => chain,
        zcard: () => chain,
        expire: () => chain,
        exec: async () => {
          if (redisState.fail) throw new Error('Redis down');
          // [zremrangebyscore, zadd, zcard, expire] — count lives at index 2
          return [[null, 1], [null, 1], [null, redisState.count], [null, 1]];
        },
      };
      return chain;
    }
  }
  return { default: MockRedis };
});

const { default: authRoutes } = await import('../routes/auth.routes.js');
const { notFound, errorHandler } = await import('../middleware/error.middleware.js');
const { default: User } = await import('../models/user.model.js');

let mongoServer;
let app;
let request;

process.env.JWT_SECRET = 'test-jwt-secret';

const testUser = { name: 'Test User', email: 'test@example.com', password: 'password123' };

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
  redisState.count = 1;
  redisState.fail = false;
});

// ─── Rate limiting ─────────────────────────────────────

describe('POST /api/auth/register — rate limiting', () => {
  it('allows requests while under the limit', async () => {
    redisState.count = 5;

    const res = await request.post('/api/auth/register').send(testUser);
    expect(res.status).toBe(201);
  });

  it('returns 429 when the limit is exceeded', async () => {
    redisState.count = 11;

    const res = await request.post('/api/auth/register').send(testUser);
    expect(res.status).toBe(429);
    expect(res.body.message).toBe('Too many requests, try again later');
  });

  it('fails open when Redis is down', async () => {
    redisState.fail = true;

    const res = await request.post('/api/auth/register').send(testUser);
    expect(res.status).toBe(201);
  });
});

describe('POST /api/auth/login — rate limiting', () => {
  beforeEach(async () => {
    await User.create(testUser);
  });

  it('allows login while under the limit', async () => {
    redisState.count = 3;

    const res = await request.post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.status).toBe(200);
  });

  it('returns 429 when the limit is exceeded', async () => {
    redisState.count = 11;

    const res = await request.post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.status).toBe(429);
  });
});

describe('GET /api/auth/profile — rate limiting (protected)', () => {
  it('returns 429 when the limit is exceeded', async () => {
    const user = await User.create(testUser);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    redisState.count = 11;

    const res = await request
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(429);
  });

  it('allows requests while under the limit', async () => {
    const user = await User.create(testUser);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    redisState.count = 2;

    const res = await request
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
