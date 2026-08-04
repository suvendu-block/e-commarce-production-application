// Pure formatting / math helpers — unit-tested, no side effects

export const formatPrice = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '$0.00';
  return `$${num.toFixed(2)}`;
};

export const formatDate = (value) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getSubtotal = (cartItems = []) =>
  cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);

// Mirrors the backend pricing rules (TAX_RATE 8%, free shipping over $100)
export const computeTotals = (cartItems = []) => {
  const itemsPrice = getSubtotal(cartItems);
  const taxPrice = +(itemsPrice * 0.08).toFixed(2);
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const totalPrice = +(itemsPrice + taxPrice + shippingPrice).toFixed(2);
  return { itemsPrice, taxPrice, shippingPrice, totalPrice };
};

export const slugify = (name) =>
  String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const classNames = (...parts) => parts.filter(Boolean).join(' ');
