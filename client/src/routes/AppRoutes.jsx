/** Route table — ARCHITECTURE.md §14, DESIGN-SYSTEM §13. Guards: Protected → Role. */
import { Routes, Route } from 'react-router-dom';

import { PublicLayout } from '../components/layout/PublicLayout.jsx';
import { DashboardLayout } from '../components/layout/DashboardLayout.jsx';
import { ProtectedRoute } from '../components/common/ProtectedRoute.jsx';
import { RoleRoute } from '../components/common/RoleRoute.jsx';

import LandingPage from '../pages/public/LandingPage.jsx';
import NotFoundPage from '../pages/public/NotFoundPage.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import RegisterPage from '../pages/auth/RegisterPage.jsx';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import { PlaceholderPage } from '../pages/PlaceholderPage.jsx';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      {/* Auth (no shell) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* Protected app shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/rooms" element={<PlaceholderPage title="Rooms" />} />
          <Route path="/bookings/me" element={<PlaceholderPage title="My Bookings" />} />
          <Route path="/calendar" element={<PlaceholderPage title="Calendar" />} />
          <Route path="/notifications" element={<PlaceholderPage title="Notifications" />} />
          <Route path="/profile" element={<PlaceholderPage title="Profile" />} />

          {/* Staff + Admin */}
          <Route element={<RoleRoute allow={['admin', 'staff']} />}>
            <Route path="/approvals" element={<PlaceholderPage title="Approvals" />} />
            <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
          </Route>

          {/* Admin only */}
          <Route element={<RoleRoute allow={['admin']} />}>
            <Route path="/users" element={<PlaceholderPage title="Users" />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
