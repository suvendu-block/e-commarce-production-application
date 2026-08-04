// Upload API — POST /upload (admin) → { url, publicId }
import api from './axios';
import { USE_MOCK } from '../constants';
import { delay } from './utils';

// Mock upload: returns a stable, realistic image URL. In live mode the
// multipart form is sent to Cloudinary via the backend.
const mockUpload = async () => {
  await delay(700);
  const seed = `upload-${Date.now()}`;
  return {
    url: `https://picsum.photos/seed/${seed}/800/800`,
    publicId: `ecommerce/products/${seed}`,
  };
};

export const uploadImage = async (file) => {
  if (USE_MOCK) return mockUpload(file);
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
