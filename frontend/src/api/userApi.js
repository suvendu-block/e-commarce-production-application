// User API — admin only: GET /users · GET/PUT/DELETE /users/:id
import api from './axios';
import { USE_MOCK } from '../constants';
import { delay, mockError } from './utils';
import { dbUsers, findUserById } from './mockData';

const publicUser = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  isAdmin: u.isAdmin,
  createdAt: u.createdAt,
});

// ── Mock implementations ──────────────────────────────────────

const mockListUsers = async () => {
  await delay(350);
  return dbUsers.map(publicUser);
};

const mockUserById = async (id) => {
  await delay(250);
  const user = findUserById(id);
  if (!user) mockError(404, 'User not found');
  return publicUser(user);
};

const mockUpdateUser = async (id, updates) => {
  await delay(450);
  const user = findUserById(id);
  if (!user) mockError(404, 'User not found');
  Object.assign(user, updates);
  return publicUser(user);
};

const mockDeleteUser = async (id) => {
  await delay(400);
  const index = dbUsers.findIndex((u) => u._id === id);
  if (index === -1) mockError(404, 'User not found');
  dbUsers.splice(index, 1);
  return { message: 'User removed' };
};

// ── Public API ────────────────────────────────────────────────

export const getUsers = async () => {
  if (USE_MOCK) return mockListUsers();
  const { data } = await api.get('/users');
  return data;
};

export const getUserById = async (id) => {
  if (USE_MOCK) return mockUserById(id);
  const { data } = await api.get(`/users/${id}`);
  return data;
};

export const updateUser = async (id, data) => {
  if (USE_MOCK) return mockUpdateUser(id, data);
  const { data: res } = await api.put(`/users/${id}`, data);
  return res;
};

export const deleteUser = async (id) => {
  if (USE_MOCK) return mockDeleteUser(id);
  const { data } = await api.delete(`/users/${id}`);
  return data;
};
