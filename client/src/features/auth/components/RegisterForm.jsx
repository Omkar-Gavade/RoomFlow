import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { FormField } from '../../../components/ui/FormField.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { Label } from '../../../components/ui/Label.jsx';
import { useAuth } from '../../../hooks/useAuth.js';
import { useToast } from '../../../hooks/useToast.js';
import { ROUTES } from '../../../constants/routes.js';

export function RegisterForm() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'student', identifier: '', department: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);
    try {
      await register(form);
      toast.success('Registration successful. Please verify your email, then log in.');
      navigate(ROUTES.LOGIN);
    } catch (err) {
      setError(err.message || 'Registration failed');
      const map = {};
      (err.fieldErrors || []).forEach((f) => {
        map[f.field] = f.message;
      });
      setFieldErrors(map);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      {error && <Alert variant="error" className="mb-4">{error}</Alert>}
      <FormField label="Full name" name="name" required value={form.name} onChange={onChange} error={fieldErrors.name} />
      <FormField label="Email" name="email" type="email" required value={form.email} onChange={onChange} error={fieldErrors.email} autoComplete="email" />
      <div className="mb-4">
        <Label htmlFor="role">Role</Label>
        <select
          id="role"
          name="role"
          value={form.role}
          onChange={onChange}
          className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="student">Student / Employee</option>
          <option value="staff">Staff / Faculty (needs admin approval)</option>
        </select>
      </div>
      <FormField label="ID (roll / employee no.)" name="identifier" value={form.identifier} onChange={onChange} error={fieldErrors.identifier} />
      <FormField label="Department" name="department" value={form.department} onChange={onChange} error={fieldErrors.department} />
      <FormField label="Password" name="password" type="password" required value={form.password} onChange={onChange} error={fieldErrors.password} hint="8+ chars, upper, lower, number & symbol" autoComplete="new-password" />
      <FormField label="Confirm password" name="confirmPassword" type="password" required value={form.confirmPassword} onChange={onChange} error={fieldErrors.confirmPassword} autoComplete="new-password" />
      <Button type="submit" className="w-full" loading={loading}>
        Create account
      </Button>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already registered?{' '}
        <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}

export default RegisterForm;
