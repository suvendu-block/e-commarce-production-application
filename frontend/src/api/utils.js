// Shared mock plumbing — latency + error shaping so the UI sees the
// same async behaviour it will get from the real backend.
import { USE_MOCK } from '../constants';

export const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  throw err;
};

export const isMock = () => USE_MOCK;
