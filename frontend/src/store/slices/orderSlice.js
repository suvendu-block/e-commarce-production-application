import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as orderApi from '../../api/orderApi';

const initialState = {
  create: { order: null, loading: false, success: false, error: null },
  detail: { order: null, loading: false, error: null },
  pay: { loading: false, success: false, error: null },
  deliver: { loading: false, success: false, error: null },
  myList: { orders: [], loading: false, error: null },
  list: { orders: [], loading: false, error: null },
};

export const createOrder = createAsyncThunk(
  'order/create',
  async ({ orderItems, shippingAddress, paymentMethod }, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      return await orderApi.createOrder(
        { orderItems, shippingAddress, paymentMethod },
        user
      );
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to place order');
    }
  }
);

export const getOrderDetails = createAsyncThunk(
  'order/detail',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      return await orderApi.getOrderById(id, user);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load order');
    }
  }
);

export const payOrder = createAsyncThunk(
  'order/pay',
  async ({ id, paymentResult }, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      return await orderApi.payOrder(id, user, paymentResult);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to mark order as paid');
    }
  }
);

export const deliverOrder = createAsyncThunk('order/deliver', async (id, { rejectWithValue }) => {
  try {
    return await orderApi.deliverOrder(id);
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to mark order as delivered');
  }
});

export const getMyOrders = createAsyncThunk('order/myList', async (_, { getState, rejectWithValue }) => {
  try {
    const { user } = getState().auth;
    return await orderApi.getMyOrders(user);
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to load orders');
  }
});

export const listOrders = createAsyncThunk('order/list', async (_, { rejectWithValue }) => {
  try {
    return await orderApi.getOrders();
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to load orders');
  }
});

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetCreate: (state) => {
      state.create = { ...initialState.create };
    },
    resetPay: (state) => {
      state.pay = { ...initialState.pay };
    },
    resetDeliver: (state) => {
      state.deliver = { ...initialState.deliver };
    },
  },
  extraReducers: (builder) => {
    builder
      // create
      .addCase(createOrder.pending, (state) => {
        state.create.loading = true;
        state.create.error = null;
        state.create.success = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.create.loading = false;
        state.create.success = true;
        state.create.order = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.create.loading = false;
        state.create.error = action.payload;
      })
      // detail
      .addCase(getOrderDetails.pending, (state) => {
        state.detail.loading = true;
        state.detail.error = null;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.detail.loading = false;
        state.detail.order = action.payload;
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.detail.loading = false;
        state.detail.error = action.payload;
      })
      // pay
      .addCase(payOrder.pending, (state) => {
        state.pay.loading = true;
        state.pay.error = null;
        state.pay.success = false;
      })
      .addCase(payOrder.fulfilled, (state, action) => {
        state.pay.loading = false;
        state.pay.success = true;
        state.detail.order = action.payload;
      })
      .addCase(payOrder.rejected, (state, action) => {
        state.pay.loading = false;
        state.pay.error = action.payload;
      })
      // deliver
      .addCase(deliverOrder.pending, (state) => {
        state.deliver.loading = true;
        state.deliver.error = null;
        state.deliver.success = false;
      })
      .addCase(deliverOrder.fulfilled, (state, action) => {
        state.deliver.loading = false;
        state.deliver.success = true;
        state.detail.order = action.payload;
      })
      .addCase(deliverOrder.rejected, (state, action) => {
        state.deliver.loading = false;
        state.deliver.error = action.payload;
      })
      // my orders
      .addCase(getMyOrders.pending, (state) => {
        state.myList.loading = true;
        state.myList.error = null;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.myList.loading = false;
        state.myList.orders = action.payload;
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.myList.loading = false;
        state.myList.error = action.payload;
      })
      // all orders
      .addCase(listOrders.pending, (state) => {
        state.list.loading = true;
        state.list.error = null;
      })
      .addCase(listOrders.fulfilled, (state, action) => {
        state.list.loading = false;
        state.list.orders = action.payload;
      })
      .addCase(listOrders.rejected, (state, action) => {
        state.list.loading = false;
        state.list.error = action.payload;
      });
  },
});

export const { resetCreate, resetPay, resetDeliver } = orderSlice.actions;
export default orderSlice.reducer;
