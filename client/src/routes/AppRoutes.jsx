/**
 * Route table — ARCHITECTURE.md §14, DESIGN-SYSTEM §13.
 *
 * Performance: every route below the landing page is a dynamic import
 * (skill "Bundle Size: Dynamic Imports"), so the first paint ships only the
 * marketing page. Suspense fallbacks are the shared LoadingScreen/Spinner.
 */
import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

import { DashboardLayout } from '../components/layout/DashboardLayout.jsx';
import { ProtectedRoute } from '../components/common/ProtectedRoute.jsx';
import { RoleRoute } from '../components/common/RoleRoute.jsx';
import { LoadingScreen } from '../components/common/LoadingScreen.jsx';
import LandingPage from '../pages/public/LandingPage.jsx';

const LoginPage = lazy(() => import('../pages/auth/LoginPage.jsx'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage.jsx'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage.jsx'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage.jsx'));
const DashboardPage = lazy(() => import('../pages/DashboardPage.jsx'));
const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage.jsx'));

import { PlaceholderPage } from '../pages/PlaceholderPage.jsx';

const withSuspense = (node) => <Suspense fallback={<LoadingScreen />}>{node}</Suspense>;

export function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth */}
      <Route path="/login" element={withSuspense(<LoginPage />)} />
      <Route path="/register" element={withSuspense(<RegisterPage />)} />
      <Route path="/forgot-password" element={withSuspense(<ForgotPasswordPage />)} />
      <Route path="/reset-password/:token" element={withSuspense(<ResetPasswordPage />)} />

      {/* Protected app shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/rooms"
            element={<PlaceholderPage title="Rooms" description="Browse, filter and book available spaces." />}
          />
          <Route
            path="/bookings/me"
            element={<PlaceholderPage title="My Bookings" description="Upcoming, pending, past and cancelled." />}
          />
          <Route
            path="/calendar"
            element={<PlaceholderPage title="Calendar" description="Month, week and day views of every booking." />}
          />
          <Route
            path="/notifications"
            element={<PlaceholderPage title="Notifications" description="Approvals, reminders and system messages." />}
          />
          <Route
            path="/profile"
            element={<PlaceholderPage title="Profile" description="Your details, avatar and password." />}
          />

          <Route element={<RoleRoute allow={['admin', 'staff']} />}>
            <Route
              path="/approvals"
              element={<PlaceholderPage title="Approvals" description="One queue for every pending request." />}
            />
            <Route
              path="/reports"
              element={<PlaceholderPage title="Reports" description="Utilisation, peak hours and exports." />}
            />
          </Route>

          <Route element={<RoleRoute allow={['admin']} />}>
            <Route
              path="/users"
              element={<PlaceholderPage title="Users" description="Roles, blocking and staff approvals." />}
            />
            <Route
              path="/settings"
              element={<PlaceholderPage title="Settings" description="Institution config, booking rules, holidays." />}
            />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={withSuspense(<NotFoundPage />)} />
    </Routes>
  );
}

export default AppRoutes;
