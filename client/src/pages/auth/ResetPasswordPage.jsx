import { AuthLayout } from './AuthLayout.jsx';
import { ResetPasswordForm } from '../../features/auth/components/ResetPasswordForm.jsx';

export default function ResetPasswordPage() {
  return (
    <AuthLayout title="Reset password" subtitle="Choose a new password">
      <ResetPasswordForm />
    </AuthLayout>
  );
}
