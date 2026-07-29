import { AuthLayout } from './AuthLayout.jsx';
import { RegisterForm } from '../../features/auth/components/RegisterForm.jsx';

export default function RegisterPage() {
  return (
    <AuthLayout title="Create your account" subtitle="Book your first room in under a minute.">
      <RegisterForm />
    </AuthLayout>
  );
}
