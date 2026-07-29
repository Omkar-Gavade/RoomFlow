/**
 * App — provider stack (ARCHITECTURE §14.1):
 * ErrorBoundary → Theme → Toast → Auth → Router content.
 */
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx';
import { ScrollToTop } from './components/common/ScrollToTop.jsx';
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
            <ScrollToTop />
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
