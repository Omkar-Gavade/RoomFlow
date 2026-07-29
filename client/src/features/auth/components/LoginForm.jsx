import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

import { FormField } from '../../../components/ui/FormField.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { useAuth } from '../../../hooks/useAuth.js';
import { useToast } from '../../../hooks/useToast.js';
import { ROUTES } from '../../../constants/routes.js';

export function LoginForm() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate(location.state?.from || ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      {error && <Alert variant="error" className="mb-4">{error}</Alert>}
      <FormField label="Email" name="email" type="email" required value={form.email} onChange={onChange} autoComplete="email" />
      <FormField label="Password" name="password" type="password" required value={form.password} onChange={onChange} autoComplete="current-password" />
      <div className="mb-4 text-right">
        <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm text-primary hover:underline">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" className="w-full" loading={loading}>
        Log in
      </Button>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        No account?{' '}
        <Link to={ROUTES.REGISTER} className="text-primary hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}

export default LoginForm;
