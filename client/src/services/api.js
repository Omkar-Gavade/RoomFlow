/**
 * Axios instance + interceptors — ARCHITECTURE.md §5.2.
 *
 * - Request: attach Bearer access token from the in-memory store.
 * - Response: on 401 TOKEN_EXPIRED, refresh ONCE and replay queued requests.
 *   A module-level `isRefreshing` flag + promise queue prevents a refresh
 *   stampede when several requests expire at once. On refresh failure → hard
 *   logout (dispatch an event the AuthContext listens for).
 * - Error normaliser: every failure becomes { code, message, fieldErrors }.
 */
import axios from 'axios';

import { env } from '../config/env.js';
import { tokenService } from './tokenService.js';

export const AUTH_LOGOUT_EVENT = 'roomflow:logout';

export const api = axios.create({
  baseURL: env.API_URL,
  withCredentials: true, // send/receive the refresh cookie
  headers: { 'Content-Type': 'application/json' },
});

// --- Request: attach access token ---
api.interceptors.request.use((config) => {
  const token = tokenService.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- Silent refresh machinery ---
let isRefreshing = false;
let queue = [];

const flushQueue = (error, token = null) => {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  queue = [];
};

/** Bare client (no interceptors) to avoid recursion during refresh. */
const refreshClient = axios.create({ baseURL: env.API_URL, withCredentials: true });

function normalizeError(error) {
  const data = error.response?.data;
  return {
    status: error.response?.status,
    code: data?.code || 'NETWORK_ERROR',
    message: data?.message || error.message || 'Something went wrong',
    fieldErrors: data?.errors || [],
  };
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const code = error.response?.data?.code;
    const isAuthRoute = original?.url?.includes('/auth/');

    // Only try to refresh on an expired access token, once, off auth routes.
    if (error.response?.status === 401 && code === 'TOKEN_EXPIRED' && !original._retry && !isAuthRoute) {
      if (isRefreshing) {
        // Queue until the in-flight refresh resolves, then replay.
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (token) => {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(api(original));
            },
            reject,
          });
        });
      }

      original._retry = true;
      isRefreshing = true;
      try {
        const { data } = await refreshClient.post('/auth/refresh');
        const newToken = data?.data?.accessToken;
        tokenService.set(newToken);
        flushQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        flushQueue(refreshError, null);
        tokenService.clear();
        window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
        return Promise.reject(normalizeError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

export default api;
