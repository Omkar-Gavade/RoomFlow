import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { FormField } from '../../../components/ui/FormField.jsx';
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.resetPassword(token, form);
      toast.success('Password reset. Please log in.');
      navigate(ROUTES.LOGIN);
    } catch (err) {
      setError(err.message || 'Reset failed — the link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      {error && <Alert variant="error" className="mb-4">{error}</Alert>}
      <FormField label="New password" name="password" type="password" required value={form.password} onChange={onChange} hint="8+ chars, upper, lower, number & symbol" autoComplete="new-password" />
      <FormField label="Confirm password" name="confirmPassword" type="password" required value={form.confirmPassword} onChange={onChange} autoComplete="new-password" />
      <Button type="submit" className="w-full" loading={loading}>
        Reset password
      </Button>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
          Back to login
        </Link>
      </p>
    </form>
  );
}

export default ResetPasswordForm;
