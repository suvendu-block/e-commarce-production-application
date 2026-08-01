import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';

// Mock Cloudinary — tests never hit the real API (needs no credentials).
// Native-ESM jest: unstable_mockModule + dynamic imports only.
jest.unstable_mockModule('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: { upload: jest.fn() },
  },
}));

const { default: uploadRoutes } = await import('../routes/upload.routes.js');
const { v2: cloudinaryV2 } = await import('cloudinary');
const { notFound, errorHandler } = await import('../middleware/error.middleware.js');
const { default: User } = await import('../models/user.model.js');

let mongoServer;
let app;
let request;

process.env.JWT_SECRET = 'test-jwt-secret';

const adminUser = { name: 'Admin', email: 'admin@example.com', password: 'password123', isAdmin: true };
const normalUser = { name: 'User', email: 'user@example.com', password: 'password123' };
let adminToken;
let userToken;

// Tiny valid JPEG-ish payload — only the mimetype matters to multer
const fakeImage = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Build a minimal app — same pattern as the other test suites
  app = express();
  app.use(express.json());
  app.use('/api/upload', uploadRoutes);
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

  cloudinaryV2.uploader.upload.mockReset();
  cloudinaryV2.uploader.upload.mockResolvedValue({
    secure_url: 'https://res.cloudinary.com/test/image/upload/v1/ecommerce/products/abc.jpg',
    public_id: 'ecommerce/products/abc',
  });
});

// ─── POST /api/upload ─────────────────────────────────

describe('POST /api/upload', () => {
  it('uploads an image as admin and returns the URL', async () => {
    const res = await request
      .post('/api/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', fakeImage, { filename: 'photo.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(201);
    expect(res.body.url).toContain('res.cloudinary.com');
    expect(res.body.publicId).toBe('ecommerce/products/abc');

    expect(cloudinaryV2.uploader.upload).toHaveBeenCalledTimes(1);
    expect(cloudinaryV2.uploader.upload).toHaveBeenCalledWith(
      'data:image/jpeg;base64,/9j/4AAQ',
      { folder: 'ecommerce/products' }
    );
  });

  it('returns 400 when no file is attached', async () => {
    const res = await request
      .post('/api/upload')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
  });

  it('returns 400 for a non-image file type', async () => {
    const res = await request
      .post('/api/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', Buffer.from('hello world'), { filename: 'notes.txt', contentType: 'text/plain' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Only image files are allowed');
  });

  it('returns 500 when Cloudinary upload fails', async () => {
    cloudinaryV2.uploader.upload.mockRejectedValue(new Error('network down'));

    const res = await request
      .post('/api/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', fakeImage, { filename: 'photo.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Upload failed');
  });

  it('returns 403 for non-admin user', async () => {
    const res = await request
      .post('/api/upload')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('image', fakeImage, { filename: 'photo.jpg', contentType: 'image/jpeg' });
    expect(res.status).toBe(403);
  });

  it('returns 401 without token', async () => {
    const res = await request
      .post('/api/upload')
      .attach('image', fakeImage, { filename: 'photo.jpg', contentType: 'image/jpeg' });
    expect(res.status).toBe(401);
  });
});
