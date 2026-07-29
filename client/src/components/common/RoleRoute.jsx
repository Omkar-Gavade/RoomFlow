/**
 * RoleRoute — ARCHITECTURE.md §11.4. Frontend guard is UX only; the API enforces
 * authorization server-side. Blocks non-permitted roles with a 403 view.
 */
import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth.js';

export function RoleRoute({ allow = [] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-center">
        <h1 className="text-2xl font-semibold">403 — Forbidden</h1>
        <p className="text-muted-foreground">You do not have access to this page.</p>
      </div>
    );
  }
  return <Outlet />;
}

export default RoleRoute;
