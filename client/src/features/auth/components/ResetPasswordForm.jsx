import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

import { FloatingField } from '../../../components/ui/FloatingField.jsx';
import { PasswordStrength } from '../../../components/ui/PasswordStrength.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { authApi } from '../authApi.js';
import { useToast } from '../../../hooks/useToast.js';
import { ROUTES } from '../../../constants/routes.js';

export function ResetPasswordForm() {
  const { token } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.resetPassword(token, form);
      toast.success('Password updated — please log in.');
      navigate(ROUTES.LOGIN);
    } catch (err) {
      setError(err.message || 'This reset link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      {error && (
        <Alert variant="error" className="mb-5">
          {error}
        </Alert>
      )}
      <FloatingField
        label="New password"
        name="password"
        type={show ? 'text' : 'password'}
        autoComplete="new-password"
        value={form.password}
        onChange={onChange}
        trailing={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
        }
        required
      />
      <PasswordStrength value={form.password} />
      <FloatingField
        label="Confirm new password"
        name="confirmPassword"
        type={show ? 'text' : 'password'}
        autoComplete="new-password"
        value={form.confirmPassword}
        onChange={onChange}
        required
      />
      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Reset password
      </Button>
      <p className="mt-6 text-center text-sm">
        <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
          <ArrowLeft size={14} /> Back to login
        </Link>
      </p>
    </form>
  );
}

export default ResetPasswordForm;
