/**
 * ProtectedRoute — ARCHITECTURE.md §11.4.
 * Waits for auth restore (LoadingScreen, no flash-of-login), then redirects
 * unauthenticated users to /login carrying the intended path in `from`.
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth.js';
import { LoadingScreen } from './LoadingScreen.jsx';
import { ROUTES } from '../../constants/routes.js';

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen label="Restoring session…" />;
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

export default ProtectedRoute;
