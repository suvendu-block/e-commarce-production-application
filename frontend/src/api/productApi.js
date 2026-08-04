// Product API — GET /products (list+search+filters) · GET /products/top
//                GET /products/:id · POST /products/:id/reviews
//                POST/PUT/DELETE /products (admin)
import api from './axios';
import { USE_MOCK, PAGE_SIZE } from '../constants';
import { delay, mockError } from './utils';
import {
  dbProducts,
  findProductById,
  addProduct,
  updateProduct as mockUpdateProduct,
  deleteProduct as mockDeleteProduct,
  addReview,
  slugify as _slugify,
  clone,
} from './mockData';

// ── Mock implementations ──────────────────────────────────────

const mockListProducts = async ({ keyword, page, pageSize, category, minPrice, maxPrice } = {}) => {
  await delay(350);
  let result = [...dbProducts];

  if (keyword) {
    const k = keyword.toLowerCase();
    result = result.filter(
      (p) => p.name.toLowerCase().includes(k) || p.description.toLowerCase().includes(k)
    );
  }
  if (category) result = result.filter((p) => p.category === category);
  if (Number.isFinite(minPrice)) result = result.filter((p) => p.price >= minPrice);
  if (Number.isFinite(maxPrice)) result = result.filter((p) => p.price <= maxPrice);

  result.sort((a, b) => b.rating - a.rating);

  const size = Math.max(1, Math.min(Number(pageSize) || PAGE_SIZE, 100));
  const pageNum = Math.max(1, Number(page) || 1);
  const count = result.length;
  const pages = Math.max(1, Math.ceil(count / size));
  const products = result.slice((pageNum - 1) * size, pageNum * size).map(clone);

  return { products, page: pageNum, pages, count };
};

const mockTopProducts = async () => {
  await delay(300);
  return [...dbProducts]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5)
    .map(clone);
};

const mockProductById = async (id) => {
  await delay(250);
  const product = findProductById(id);
  if (!product) mockError(404, 'Product not found');
  return JSON.parse(JSON.stringify(product));
};

const mockCreateProduct = async (data) => {
  await delay(450);
  return addProduct({
    name: data.name,
    slug: _slugify(data.name),
    price: data.price,
    description: data.description || '',
    image: data.image || 'https://picsum.photos/seed/new-product/800/800',
    brand: data.brand || '',
    category: data.category || '',
    countInStock: data.countInStock ?? 0,
  });
};

const mockUpdateProductById = async (id, data) => {
  await delay(450);
  const existing = findProductById(id);
  if (!existing) mockError(404, 'Product not found');
  const patch = { ...data };
  if (data.name && data.name !== existing.name) patch.slug = _slugify(data.name);
  return mockUpdateProduct(id, patch);
};

const mockDeleteProductById = async (id) => {
  await delay(400);
  if (!mockDeleteProduct(id)) mockError(404, 'Product not found');
  return { message: 'Product removed' };
};

const mockCreateReview = async (productId, { rating, comment }, user) => {
  await delay(500);
  const result = addReview(productId, {
    user: user._id,
    name: user.name,
    rating,
    comment,
  });
  if (result === 'DUPLICATE') mockError(400, 'Product already reviewed');
  if (!result) mockError(404, 'Product not found');
  return { message: 'Review added' };
};

// ── Public API ────────────────────────────────────────────────

export const getProducts = async (params) => {
  if (USE_MOCK) return mockListProducts(params);
  const { data } = await api.get('/products', { params });
  return data;
};

export const getTopProducts = async () => {
  if (USE_MOCK) return mockTopProducts();
  const { data } = await api.get('/products/top');
  return data;
};

export const getProductById = async (id) => {
  if (USE_MOCK) return mockProductById(id);
  const { data } = await api.get(`/products/${id}`);
  return data;
};

export const createProduct = async (data) => {
  if (USE_MOCK) return mockCreateProduct(data);
  const { data: res } = await api.post('/products', data);
  return res;
};

export const updateProduct = async (id, data) => {
  if (USE_MOCK) return mockUpdateProductById(id, data);
  const { data: res } = await api.put(`/products/${id}`, data);
  return res;
};

export const deleteProduct = async (id) => {
  if (USE_MOCK) return mockDeleteProductById(id);
  const { data } = await api.delete(`/products/${id}`);
  return data;
};

export const createReview = async (productId, data, user) => {
  if (USE_MOCK) return mockCreateReview(productId, data, user);
  const { data: res } = await api.post(`/products/${productId}/reviews`, data);
  return res;
};
