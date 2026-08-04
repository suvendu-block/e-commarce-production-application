import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as productApi from '../../api/productApi';

const initialState = {
  list: { products: [], page: 1, pages: 1, count: 0, loading: false, error: null },
  detail: { product: null, loading: false, error: null },
  top: { products: [], loading: false, error: null },
  review: { loading: false, error: null, success: false },
  create: { product: null, loading: false, error: null, success: false },
  update: { product: null, loading: false, error: null, success: false },
  remove: { loading: false, error: null, success: false },
};

export const listProducts = createAsyncThunk(
  'product/list',
  async (params, { rejectWithValue }) => {
    try {
      return await productApi.getProducts(params);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load products');
    }
  }
);

export const getProductDetails = createAsyncThunk(
  'product/detail',
  async (id, { rejectWithValue }) => {
    try {
      return await productApi.getProductById(id);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load product');
    }
  }
);

export const getTopProducts = createAsyncThunk('product/top', async (_, { rejectWithValue }) => {
  try {
    return await productApi.getTopProducts();
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to load top products');
  }
});

export const createProductReview = createAsyncThunk(
  'product/review',
  async ({ productId, rating, comment }, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      return await productApi.createReview(productId, { rating, comment }, user);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to add review');
    }
  }
);

export const createProduct = createAsyncThunk('product/create', async (data, { rejectWithValue }) => {
  try {
    return await productApi.createProduct(data);
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to create product');
  }
});

export const updateProduct = createAsyncThunk(
  'product/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await productApi.updateProduct(id, data);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk('product/delete', async (id, { rejectWithValue }) => {
  try {
    return await productApi.deleteProduct(id);
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to delete product');
  }
});

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    resetReview: (state) => {
      state.review = { ...initialState.review };
    },
    resetCreate: (state) => {
      state.create = { ...initialState.create };
    },
    resetUpdate: (state) => {
      state.update = { ...initialState.update };
    },
    resetRemove: (state) => {
      state.remove = { ...initialState.remove };
    },
  },
  extraReducers: (builder) => {
    builder
      // list
      .addCase(listProducts.pending, (state) => {
        state.list.loading = true;
        state.list.error = null;
      })
      .addCase(listProducts.fulfilled, (state, action) => {
        state.list.loading = false;
        state.list.products = action.payload.products;
        state.list.page = action.payload.page;
        state.list.pages = action.payload.pages;
        state.list.count = action.payload.count;
      })
      .addCase(listProducts.rejected, (state, action) => {
        state.list.loading = false;
        state.list.error = action.payload;
      })
      // detail
      .addCase(getProductDetails.pending, (state) => {
        state.detail.loading = true;
        state.detail.error = null;
      })
      .addCase(getProductDetails.fulfilled, (state, action) => {
        state.detail.loading = false;
        state.detail.product = action.payload;
      })
      .addCase(getProductDetails.rejected, (state, action) => {
        state.detail.loading = false;
        state.detail.error = action.payload;
      })
      // top
      .addCase(getTopProducts.pending, (state) => {
        state.top.loading = true;
        state.top.error = null;
      })
      .addCase(getTopProducts.fulfilled, (state, action) => {
        state.top.loading = false;
        state.top.products = action.payload;
      })
      .addCase(getTopProducts.rejected, (state, action) => {
        state.top.loading = false;
        state.top.error = action.payload;
      })
      // review
      .addCase(createProductReview.pending, (state) => {
        state.review.loading = true;
        state.review.error = null;
        state.review.success = false;
      })
      .addCase(createProductReview.fulfilled, (state) => {
        state.review.loading = false;
        state.review.success = true;
      })
      .addCase(createProductReview.rejected, (state, action) => {
        state.review.loading = false;
        state.review.error = action.payload;
      })
      // create
      .addCase(createProduct.pending, (state) => {
        state.create.loading = true;
        state.create.error = null;
        state.create.success = false;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.create.loading = false;
        state.create.success = true;
        state.create.product = action.payload;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.create.loading = false;
        state.create.error = action.payload;
      })
      // update
      .addCase(updateProduct.pending, (state) => {
        state.update.loading = true;
        state.update.error = null;
        state.update.success = false;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.update.loading = false;
        state.update.success = true;
        state.update.product = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.update.loading = false;
        state.update.error = action.payload;
      })
      // delete
      .addCase(deleteProduct.pending, (state) => {
        state.remove.loading = true;
        state.remove.error = null;
        state.remove.success = false;
      })
      .addCase(deleteProduct.fulfilled, (state) => {
        state.remove.loading = false;
        state.remove.success = true;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.remove.loading = false;
        state.remove.error = action.payload;
      });
  },
});

export const { resetReview, resetCreate, resetUpdate, resetRemove } = productSlice.actions;
export default productSlice.reducer;
