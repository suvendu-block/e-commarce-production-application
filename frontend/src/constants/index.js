// Shared app constants — single source of truth for config-ish values
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// When true, every api/* module resolves from the local mock database
// (src/api/mockData.js) instead of hitting the backend.
// Flip with VITE_USE_MOCK=false to go live against the real API.
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export const PAGE_SIZE = 10;

export const PAYMENT_METHODS = ['Stripe', 'PayPal', 'COD'];

export const CART_KEY = 'cartItems';
export const CART_SHIPPING_KEY = 'shippingAddress';
export const CART_PAYMENT_KEY = 'paymentMethod';
export const USER_INFO_KEY = 'userInfo';
export const THEME_KEY = 'theme';

export const TAX_RATE = 0.08;
export const FREE_SHIPPING_THRESHOLD = 100;
export const FLAT_SHIPPING = 10;

export const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Kitchen',
  'Books',
  'Sports',
];
