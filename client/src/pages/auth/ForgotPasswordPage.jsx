import { AuthLayout } from './AuthLayout.jsx';
import { ForgotPasswordForm } from '../../features/auth/components/ForgotPasswordForm.jsx';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout title="Forgot password" subtitle="We'll email you a reset link">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
