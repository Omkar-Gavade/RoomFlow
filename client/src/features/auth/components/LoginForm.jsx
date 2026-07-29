import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

import { FloatingField } from '../../../components/ui/FloatingField.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { SocialButtons } from './SocialButtons.jsx';
import { useAuth } from '../../../hooks/useAuth.js';
import { useToast } from '../../../hooks/useToast.js';
import { ROUTES } from '../../../constants/routes.js';

export function LoginForm() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back');
      navigate(location.state?.from || ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
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
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        value={form.email}
        onChange={onChange}
        required
      />
      <FloatingField
        label="Password"
        name="password"
        type={show ? 'text' : 'password'}
        autoComplete="current-password"
        value={form.password}
        onChange={onChange}
        required
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
      />

      <div className="mb-5 flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" className="h-4 w-4 rounded border-border accent-[var(--color-primary)]" />
          Remember me
        </label>
        <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm font-medium text-primary hover:underline">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Log in <ArrowRight size={16} />
      </Button>

      <SocialButtons />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to RoomFlow?{' '}
        <Link to={ROUTES.REGISTER} className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export default LoginForm;
