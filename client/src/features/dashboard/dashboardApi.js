/** Dashboard API — one call per role (ARCHITECTURE §10.5, FR-DASH-04). */
import { api } from '../../services/api.js';

export const dashboardApi = {
  admin: () => api.get('/dashboard/admin').then((r) => r.data.data),
  staff: () => api.get('/dashboard/staff').then((r) => r.data.data),
  student: () => api.get('/dashboard/student').then((r) => r.data.data),
  stats: () => api.get('/dashboard/stats').then((r) => r.data.data),
};

export default dashboardApi;
