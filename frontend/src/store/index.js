import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import cartReducer, { cartPersist } from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import userReducer from './slices/userSlice';
import uploadReducer from './slices/uploadSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    cart: cartReducer,
    order: orderReducer,
    user: userReducer,
    upload: uploadReducer,
  },
});

// Persist cart (items + shipping + payment) to localStorage on every change
store.subscribe(() => {
  cartPersist(store.getState().cart);
});

export default store;
