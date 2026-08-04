import { createSlice } from '@reduxjs/toolkit';
import {
  CART_KEY,
  CART_SHIPPING_KEY,
  CART_PAYMENT_KEY,
} from '../../constants';

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const initialState = {
  cartItems: read(CART_KEY, []),
  shippingAddress: read(CART_SHIPPING_KEY, null),
  paymentMethod: read(CART_PAYMENT_KEY, 'COD'),
};

// Called from store.subscribe — persists the current cart to localStorage
const persist = (state) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(state.cartItems));
    if (state.shippingAddress) localStorage.setItem(CART_SHIPPING_KEY, JSON.stringify(state.shippingAddress));
    if (state.paymentMethod) localStorage.setItem(CART_PAYMENT_KEY, JSON.stringify(state.paymentMethod));
  } catch {
    // storage full / unavailable — non-fatal
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, qty } = action.payload;
      const existing = state.cartItems.find((item) => item.product === product._id);
      if (existing) {
        existing.qty = Math.min(qty, product.countInStock);
      } else {
        state.cartItems.push({
          product: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          countInStock: product.countInStock,
          qty: Math.min(qty, product.countInStock),
        });
      }
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((item) => item.product !== action.payload);
    },
    setQty: (state, action) => {
      const { productId, qty } = action.payload;
      const item = state.cartItems.find((i) => i.product === productId);
      if (item) item.qty = Math.max(1, Math.min(qty, item.countInStock));
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    clearCart: (state) => {
      state.cartItems = [];
      try {
        localStorage.removeItem(CART_KEY);
      } catch {
        // ignore
      }
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  setQty,
  saveShippingAddress,
  savePaymentMethod,
  clearCart,
} = cartSlice.actions;

export const cartPersist = persist;
export default cartSlice.reducer;
