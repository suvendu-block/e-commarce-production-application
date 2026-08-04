// ─────────────────────────────────────────────────────────────
// Mock database — in-memory stand-in for the backend.
// Mirrors the real API contract 1:1 (see frontend/FRONTEND-STEPS.md)
// so switching to the live backend is a one-line change
// (VITE_USE_MOCK=false).
//
// State is module-level; everything is synchronous against
// plain arrays/objects, wrapped in a latency delay by the api/* layer.
// ─────────────────────────────────────────────────────────────

let idCounter = 100;

const oid = () => {
  idCounter += 1;
  return `64f0a2b${idCounter}000000000000${idCounter}`;
};

const now = () => new Date().toISOString();

// ── Users ────────────────────────────────────────────────────
// Passwords stored plain here — mock only, never shipped to a backend.
export const dbUsers = [
  {
    _id: '64f0a2b100000000000000001',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    isAdmin: true,
    createdAt: '2026-01-05T10:00:00.000Z',
  },
  {
    _id: '64f0a2b200000000000000002',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'john123',
    isAdmin: false,
    createdAt: '2026-01-06T10:00:00.000Z',
  },
];

// ── Products ──────────────────────────────────────────────────
// 12 products across 5 categories — mirrors backend/seed.js
const productSeeds = [
  {
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    category: 'Electronics',
    price: 1299,
    countInStock: 20,
    description:
      'Titanium frame, A17 Pro chip and a pro camera system. The most powerful iPhone Apple has ever made.',
    reviews: [
      { name: 'John Doe', rating: 5, comment: 'Best phone I have owned.' },
      { name: 'Sarah K.', rating: 4, comment: 'Battery could be better.' },
    ],
  },
  {
    name: 'Samsung Galaxy S24',
    brand: 'Samsung',
    category: 'Electronics',
    price: 1099,
    countInStock: 15,
    description: 'Galaxy AI, 120Hz AMOLED display and a 200MP camera system.',
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    brand: 'Sony',
    category: 'Electronics',
    price: 399,
    countInStock: 30,
    description:
      'Industry-leading noise cancelling and 30-hour battery life in a featherweight frame.',
    reviews: [
      { name: 'John Doe', rating: 5, comment: 'Noise cancelling is unreal.' },
      { name: 'Priya M.', rating: 5, comment: 'Super comfortable.' },
    ],
  },
  {
    name: 'MacBook Air M3',
    brand: 'Apple',
    category: 'Electronics',
    price: 1499,
    countInStock: 10,
    description: '13.6-inch Liquid Retina display and 18-hour battery life, silent and cool.',
  },
  {
    name: "Levi's 501 Jeans",
    brand: "Levi's",
    category: 'Clothing',
    price: 89.5,
    countInStock: 50,
    description: 'Classic straight-fit denim in 100% cotton. A style that never goes out of fashion.',
  },
  {
    name: 'Nike Air Max 270',
    brand: 'Nike',
    category: 'Clothing',
    price: 150,
    countInStock: 40,
    description: 'Air cushioning with a stylish lifestyle look that works anywhere.',
  },
  {
    name: 'Adidas Ultraboost Light',
    brand: 'Adidas',
    category: 'Clothing',
    price: 180,
    countInStock: 25,
    description: 'The lightest Ultraboost ever, with an energy-returning midsole.',
  },
  {
    name: 'Ninja Foodi Air Fryer',
    brand: 'Ninja',
    category: 'Home & Kitchen',
    price: 199,
    countInStock: 18,
    description: 'Air fry, roast, broil and dehydrate in one countertop appliance.',
    reviews: [{ name: 'John Doe', rating: 4, comment: 'Crispy fries every time.' }],
  },
  {
    name: 'Dyson V15 Detect',
    brand: 'Dyson',
    category: 'Home & Kitchen',
    price: 749,
    countInStock: 8,
    description: 'Cordless vacuum with laser dust detection and 60 minutes of run time.',
  },
  {
    name: 'Yeti Rambler Tumbler 30oz',
    brand: 'Yeti',
    category: 'Home & Kitchen',
    price: 39.95,
    countInStock: 100,
    description: 'Keeps drinks cold for hours. Dishwasher safe and endlessly durable.',
  },
  {
    name: 'Kindle Paperwhite',
    brand: 'Amazon',
    category: 'Books',
    price: 149.99,
    countInStock: 35,
    description: '6.8-inch glare-free display and 10 weeks of battery life in your pocket.',
  },
  {
    name: 'Wilson NBA Official Basketball',
    brand: 'Wilson',
    category: 'Sports',
    price: 29.99,
    countInStock: 60,
    description: 'The official game ball used in the NBA. Pro grip, pro feel.',
  },
];

export const slugify = (name) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const dbProducts = productSeeds.map((p, i) => {
  const reviews = (p.reviews || []).map((r) => ({
    _id: oid(),
    user: '64f0a2b200000000000000002',
    name: r.name,
    rating: r.rating,
    comment: r.comment,
    createdAt: now(),
  }));
  const rating = reviews.length
    ? +(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;
  return {
    _id: `64f0a2b3000000000000000${String(i + 1).padStart(3, '0')}`,
    name: p.name,
    slug: slugify(p.name),
    brand: p.brand,
    category: p.category,
    price: p.price,
    countInStock: p.countInStock,
    description: p.description,
    image: `https://picsum.photos/seed/${slugify(p.name)}/800/800`,
    rating,
    numReviews: reviews.length,
    reviews,
    createdAt: now(),
  };
});

// ── Orders ────────────────────────────────────────────────────
export const dbOrders = [];

// ── Helpers ───────────────────────────────────────────────────

export const findProductById = (id) => dbProducts.find((p) => p._id === id) || null;

export const findUserById = (id) => dbUsers.find((u) => u._id === id) || null;

export const findUserByEmail = (email) =>
  dbUsers.find((u) => u.email.toLowerCase() === String(email).toLowerCase()) || null;

export const addUser = (user) => {
  const created = { ...user, _id: oid(), createdAt: now() };
  dbUsers.push(created);
  return created;
};

export const addProduct = (product) => {
  const created = {
    _id: oid(),
    rating: 0,
    numReviews: 0,
    reviews: [],
    createdAt: now(),
    ...product,
  };
  dbProducts.unshift(created);
  return clone(created);
};

export const updateProduct = (id, patch) => {
  const product = findProductById(id);
  if (!product) return null;
  Object.assign(product, patch);
  return clone(product);
};

export const deleteProduct = (id) => {
  const index = dbProducts.findIndex((p) => p._id === id);
  if (index === -1) return false;
  dbProducts.splice(index, 1);
  return true;
};

export const addReview = (productId, { user, name, rating, comment }) => {
  const product = findProductById(productId);
  if (!product) return null;
  if (product.reviews.some((r) => r.user === user)) return 'DUPLICATE';
  product.reviews.push({ _id: oid(), user, name, rating, comment, createdAt: now() });
  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length;
  return clone(product);
};

export const decrementStock = (productId, qty) => {
  const product = findProductById(productId);
  if (!product) return false;
  if (product.countInStock < qty) return false;
  product.countInStock -= qty;
  return true;
};

export const createOrder = (order) => {
  const created = { _id: oid(), createdAt: now(), ...order };
  dbOrders.unshift(created);
  return clone(created);
};

export const findOrderById = (id) => dbOrders.find((o) => o._id === id) || null;

// Deep clone for anything crossing out of the mock DB into app state.
// Redux Toolkit freezes stored objects — handing it a live dbProducts /
// dbOrders reference would freeze the mock DB itself and break later
// mutations (decrementStock, pay, deliver, admin edits).
export const clone = (value) =>
  typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));

export const updateOrder = (id, patch) => {
  const order = findOrderById(id);
  if (!order) return null;
  Object.assign(order, patch);
  return clone(order);
};
