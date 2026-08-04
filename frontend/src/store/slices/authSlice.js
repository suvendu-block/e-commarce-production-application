import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '../../api/authApi';
import { USER_INFO_KEY } from '../../constants';

const stored = authApi.loadStoredUser();

const initialState = {
  user: stored ? { _id: stored._id, name: stored.name, email: stored.email, isAdmin: stored.isAdmin } : null,
  token: stored ? stored.token : null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    return await authApi.login({ email, password });
  } catch (err) {
    return rejectWithValue(err.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async ({ name, email, password }, { rejectWithValue }) => {
  try {
    return await authApi.register({ name, email, password });
  } catch (err) {
    return rejectWithValue(err.message || 'Registration failed');
  }
});

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { getState, rejectWithValue }) => {
  try {
    const { token } = getState().auth;
    return await authApi.getProfile(token);
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to load profile');
  }
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ name, email, password }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const updates = {};
      if (name) updates.name = name;
      if (email) updates.email = email;
      if (password) updates.password = password;
      return await authApi.updateProfile(token, updates);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      authApi.clearStoredUser();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };
    const authed = (state, action) => {
      state.loading = false;
      state.error = null;
      state.user = {
        _id: action.payload._id,
        name: action.payload.name,
        email: action.payload.email,
        isAdmin: action.payload.isAdmin,
      };
      state.token = action.payload.token;
      authApi.persistUser(action.payload);
    };
    builder
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, authed)
      .addCase(login.rejected, rejected)
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, authed)
      .addCase(register.rejected, rejected)
      .addCase(fetchProfile.pending, pending)
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        const existing = JSON.parse(localStorage.getItem(USER_INFO_KEY) || '{}');
        authApi.persistUser({ ...existing, ...action.payload });
      })
      .addCase(fetchProfile.rejected, rejected)
      .addCase(updateProfile.pending, pending)
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.user = {
          _id: action.payload._id,
          name: action.payload.name,
          email: action.payload.email,
          isAdmin: action.payload.isAdmin,
        };
        state.token = action.payload.token;
        authApi.persistUser(action.payload);
      })
      .addCase(updateProfile.rejected, rejected);
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
