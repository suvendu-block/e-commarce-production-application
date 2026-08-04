// Auth API — POST /auth/register · POST /auth/login ·
//              GET/PUT /auth/profile
import api from './axios';
import { USE_MOCK, USER_INFO_KEY } from '../constants';
import { delay, isMock, mockError } from './utils';
import { dbUsers, findUserByEmail, findUserById, addUser } from './mockData';

// Mock tokens are `mock.<userId>.<timestamp>` — verifiable, revocable-ish, no crypto needed.
const signMockToken = (userId) => `mock.${userId}.${Date.now()}`;

const decodeMockToken = (token) => {
  const parts = String(token || '').split('.');
  return parts[0] === 'mock' ? parts[1] : null;
};

export const getTokenUser = () => {
  if (!isMock()) return null;
  const stored = localStorage.getItem(USER_INFO_KEY);
  if (!stored) return null;
  try {
    const { token } = JSON.parse(stored);
    const userId = decodeMockToken(token);
    return userId ? findUserById(userId) : null;
  } catch {
    return null;
  }
};

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
});

// ── Mock implementations ──────────────────────────────────────

const mockRegister = async ({ name, email, password }) => {
  await delay(500);
  if (findUserByEmail(email)) mockError(400, 'User already exists');
  const user = addUser({ name, email, password, isAdmin: false });
  return { ...publicUser(user), token: signMockToken(user._id) };
};

const mockLogin = async ({ email, password }) => {
  await delay(450);
  const user = findUserByEmail(email);
  if (!user || user.password !== password) mockError(401, 'Invalid email or password');
  return { ...publicUser(user), token: signMockToken(user._id) };
};

const mockGetProfile = async (token) => {
  await delay(300);
  const userId = decodeMockToken(token);
  const user = userId && findUserById(userId);
  if (!user) mockError(401, 'Not authorized, token failed');
  return publicUser(user);
};

const mockUpdateProfile = async (token, updates) => {
  await delay(500);
  const userId = decodeMockToken(token);
  const user = userId && findUserById(userId);
  if (!user) mockError(401, 'Not authorized, token failed');
  if (updates.email && findUserByEmail(updates.email) && findUserByEmail(updates.email)._id !== user._id) {
    mockError(400, 'Email already in use');
  }
  Object.assign(user, updates);
  return { ...publicUser(user), token: signMockToken(user._id) };
};

// ── Public API (components call these — shape is backend-identical) ──

export const register = async (data) => {
  if (USE_MOCK) return mockRegister(data);
  const { data: res } = await api.post('/auth/register', data);
  return res;
};

export const login = async (data) => {
  if (USE_MOCK) return mockLogin(data);
  const { data: res } = await api.post('/auth/login', data);
  return res;
};

export const getProfile = async (token) => {
  if (USE_MOCK) return mockGetProfile(token);
  const { data: res } = await api.get('/auth/profile');
  return res;
};

export const updateProfile = async (token, data) => {
  if (USE_MOCK) return mockUpdateProfile(token, data);
  const { data: res } = await api.put('/auth/profile', data);
  return res;
};

// Stored user info for the app to restore sessions on refresh
export const loadStoredUser = () => {
  const stored = localStorage.getItem(USER_INFO_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem(USER_INFO_KEY);
    return null;
  }
};

export const persistUser = (userInfo) => {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
};

export const clearStoredUser = () => {
  localStorage.removeItem(USER_INFO_KEY);
};

export { dbUsers };
