import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as userApi from '../../api/userApi';

const initialState = {
  list: { users: [], loading: false, error: null },
  update: { user: null, loading: false, success: false, error: null },
  remove: { loading: false, success: false, error: null },
};

export const listUsers = createAsyncThunk('user/list', async (_, { rejectWithValue }) => {
  try {
    return await userApi.getUsers();
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to load users');
  }
});

export const updateUser = createAsyncThunk(
  'user/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await userApi.updateUser(id, data);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk('user/delete', async (id, { rejectWithValue }) => {
  try {
    return await userApi.deleteUser(id);
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to delete user');
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    resetUpdate: (state) => {
      state.update = { ...initialState.update };
    },
    resetRemove: (state) => {
      state.remove = { ...initialState.remove };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listUsers.pending, (state) => {
        state.list.loading = true;
        state.list.error = null;
      })
      .addCase(listUsers.fulfilled, (state, action) => {
        state.list.loading = false;
        state.list.users = action.payload;
      })
      .addCase(listUsers.rejected, (state, action) => {
        state.list.loading = false;
        state.list.error = action.payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.update.loading = true;
        state.update.error = null;
        state.update.success = false;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.update.loading = false;
        state.update.success = true;
        state.update.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.update.loading = false;
        state.update.error = action.payload;
      })
      .addCase(deleteUser.pending, (state) => {
        state.remove.loading = true;
        state.remove.error = null;
        state.remove.success = false;
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.remove.loading = false;
        state.remove.success = true;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.remove.loading = false;
        state.remove.error = action.payload;
      });
  },
});

export const { resetUpdate, resetRemove } = userSlice.actions;
export default userSlice.reducer;
