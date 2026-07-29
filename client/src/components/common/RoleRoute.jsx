/**
 * RoleRoute — ARCHITECTURE.md §11.4. A UX guard only: the API enforces
 * authorization server-side on every request. Denial renders the shared
 * PermissionDenied state rather than a bare 403 string.
 */
import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth.js';
import { PermissionDenied } from '../ui/States.jsx';
import { ROUTES } from '../../constants/routes.js';

export function RoleRoute({ allow = [] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  if (!allow.includes(user.role)) return <PermissionDenied />;
  return <Outlet />;
}

export default RoleRoute;
