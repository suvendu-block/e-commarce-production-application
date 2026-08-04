// Order API — POST /orders · GET /orders/myorders · GET /orders/:id
//              PUT /orders/:id/pay · PUT /orders/:id/deliver · GET /orders (admin)
import api from './axios';
import { USE_MOCK, TAX_RATE, FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING } from '../constants';
import { delay, mockError } from './utils';
import {
  dbOrders,
  findProductById,
  findUserById,
  findOrderById,
  createOrder as createMockOrder,
  updateOrder as mockUpdateOrder,
  decrementStock,
} from './mockData';

const ordersForUser = (userId) => dbOrders.filter((o) => o.user === userId);

// ── Mock implementations ──────────────────────────────────────

// Mirrors backend/controllers/order.controller.js: prices are computed
// server-side from DB data, never trusted from the client.
const mockCreateOrder = async ({ orderItems, shippingAddress, paymentMethod }, user) => {
  await delay(600);

  const items = [];
  for (const item of orderItems) {
    const product = findProductById(item.product);
    if (!product) mockError(400, 'One or more products not found');
    if (product.countInStock < item.qty) mockError(400, `Insufficient stock for ${product.name}`);
    items.push({
      name: product.name,
      qty: item.qty,
      image: product.image,
      price: product.price,
      product: product._id,
    });
  }

  const itemsPrice = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const taxPrice = +(itemsPrice * TAX_RATE).toFixed(2);
  const shippingPrice = itemsPrice > FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const totalPrice = +(itemsPrice + taxPrice + shippingPrice).toFixed(2);

  for (const item of items) {
    decrementStock(item.product, item.qty);
  }

  return createMockOrder({
    user: user._id,
    orderItems: items,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isPaid: false,
    isDelivered: false,
  });
};

const mockMyOrders = async (userId) => {
  await delay(350);
  return ordersForUser(userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const mockOrderById = async (id, user) => {
  await delay(300);
  const order = findOrderById(id);
  if (!order) mockError(404, 'Order not found');
  const isOwner = order.user === user._id;
  if (!isOwner && !user.isAdmin) mockError(403, 'Not authorized to view this order');
  return JSON.parse(JSON.stringify(order));
};

const mockPayOrder = async (id, user, paymentResult) => {
  await delay(500);
  const order = findOrderById(id);
  if (!order) mockError(404, 'Order not found');
  const isOwner = order.user === user._id;
  if (!isOwner && !user.isAdmin) mockError(403, 'Not authorized to pay this order');
  return mockUpdateOrder(id, {
    isPaid: true,
    paidAt: new Date().toISOString(),
    paymentResult: paymentResult || {},
  });
};

const mockDeliverOrder = async (id) => {
  await delay(500);
  const order = findOrderById(id);
  if (!order) mockError(404, 'Order not found');
  return mockUpdateOrder(id, {
    isDelivered: true,
    deliveredAt: new Date().toISOString(),
  });
};

const mockAllOrders = async () => {
  await delay(400);
  return [...dbOrders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((order) => {
      const user = findUserById(order.user);
      return { ...order, userName: user ? user.name : 'Unknown' };
    });
};

// ── Public API (backend-identical signatures) ─────────────────

export const createOrder = async (data, user) => {
  if (USE_MOCK) return mockCreateOrder(data, user);
  const { data: res } = await api.post('/orders', data);
  return res;
};

export const getMyOrders = async (user) => {
  if (USE_MOCK) return mockMyOrders(user._id);
  const { data } = await api.get('/orders/myorders');
  return data;
};

export const getOrderById = async (id, user) => {
  if (USE_MOCK) return mockOrderById(id, user);
  const { data } = await api.get(`/orders/${id}`);
  return data;
};

export const payOrder = async (id, user, paymentResult) => {
  if (USE_MOCK) return mockPayOrder(id, user, paymentResult);
  const { data } = await api.put(`/orders/${id}/pay`, { paymentResult });
  return data;
};

export const deliverOrder = async (id) => {
  if (USE_MOCK) return mockDeliverOrder(id);
  const { data } = await api.put(`/orders/${id}/deliver`);
  return data;
};

export const getOrders = async () => {
  if (USE_MOCK) return mockAllOrders();
  const { data } = await api.get('/orders');
  return data;
};
