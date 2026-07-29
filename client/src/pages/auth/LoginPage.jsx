import { AuthLayout } from './AuthLayout.jsx';
import { LoginForm } from '../../features/auth/components/LoginForm.jsx';

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome back" subtitle="Log in to manage your bookings.">
      <LoginForm />
    </AuthLayout>
  );
}
