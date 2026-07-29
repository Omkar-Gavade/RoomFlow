/**
 * App — provider stack (ARCHITECTURE §14.1):
 * ErrorBoundary → Theme → Toast → Auth → Routes.
 *
 * A skip-link is the first focusable element so keyboard users can jump past the
 * navigation to <main id="main"> (§15 keyboard navigation).
 */
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx';
import { ScrollToTop } from './components/common/ScrollToTop.jsx';
import { OfflineBanner } from './components/common/OfflineBanner.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { AppRoutes } from './routes/AppRoutes.jsx';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
            >
              Skip to main content
            </a>
            <OfflineBanner />
            <ScrollToTop />
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
