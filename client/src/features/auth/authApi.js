/** Auth API calls — maps to backend /auth (ARCHITECTURE §10.2). */
import { api } from '../../services/api.js';

export const authApi = {
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data),
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data),
  refresh: () => api.post('/auth/refresh').then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword: (token, payload) =>
    api.post(`/auth/reset-password/${token}`, payload).then((r) => r.data),
};

export default authApi;
