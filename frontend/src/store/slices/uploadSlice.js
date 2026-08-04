import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { uploadImage } from '../../api/uploadApi';

const initialState = {
  url: null,
  publicId: null,
  loading: false,
  error: null,
};

export const upload = createAsyncThunk('upload/image', async (file, { rejectWithValue }) => {
  try {
    return await uploadImage(file);
  } catch (err) {
    return rejectWithValue(err.message || 'Upload failed');
  }
});

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    resetUpload: (state) => {
      state.url = null;
      state.publicId = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(upload.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(upload.fulfilled, (state, action) => {
        state.loading = false;
        state.url = action.payload.url;
        state.publicId = action.payload.publicId;
      })
      .addCase(upload.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetUpload } = uploadSlice.actions;
export default uploadSlice.reducer;
