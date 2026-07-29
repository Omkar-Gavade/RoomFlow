import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

import { FloatingField } from '../../../components/ui/FloatingField.jsx';
import { PasswordStrength } from '../../../components/ui/PasswordStrength.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { SocialButtons } from './SocialButtons.jsx';
import { useAuth } from '../../../hooks/useAuth.js';
import { useToast } from '../../../hooks/useToast.js';
import { ROUTES } from '../../../constants/routes.js';
import { cn } from '../../../lib/cn.js';

const ROLE_OPTIONS = [
  { value: 'student', label: 'Student / Employee', hint: 'Instant access' },
  { value: 'staff', label: 'Staff / Faculty', hint: 'Needs admin approval' },
];

export function RegisterForm() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'student', identifier: '', department: '',
  });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created — check your email to verify.');
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
      {error && (
        <Alert variant="error" className="mb-5">
          {error}
        </Alert>
      )}

      {/* Role selector — segmented, keyboard reachable via real radios */}
      <fieldset className="mb-5">
        <legend className="mb-2 text-sm font-medium text-foreground">I am a</legend>
        <div className="grid grid-cols-2 gap-2">
          {ROLE_OPTIONS.map((o) => {
            const active = form.role === o.value;
            return (
              <label
                key={o.value}
                className={cn(
                  'cursor-pointer rounded-md border p-3 text-left transition-all duration-200',
                  active
                    ? 'border-primary bg-primary/8 ring-2 ring-primary/15'
                    : 'border-border bg-card hover:bg-muted'
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value={o.value}
                  checked={active}
                  onChange={onChange}
                  className="sr-only"
                />
                <span className={cn('block text-sm font-medium', active ? 'text-primary' : 'text-foreground')}>
                  {o.label}
                </span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">{o.hint}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <FloatingField label="Full name" name="name" value={form.name} onChange={onChange} error={fieldErrors.name} required />
      <FloatingField label="Email address" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} error={fieldErrors.email} required />

      <div className="grid gap-x-3 sm:grid-cols-2">
        <FloatingField label="ID number" name="identifier" value={form.identifier} onChange={onChange} error={fieldErrors.identifier} />
        <FloatingField label="Department" name="department" value={form.department} onChange={onChange} error={fieldErrors.department} />
      </div>

      <FloatingField
        label="Password"
        name="password"
        type={show ? 'text' : 'password'}
        autoComplete="new-password"
        value={form.password}
        onChange={onChange}
        error={fieldErrors.password}
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
        label="Confirm password"
        name="confirmPassword"
        type={show ? 'text' : 'password'}
        autoComplete="new-password"
        value={form.confirmPassword}
        onChange={onChange}
        error={fieldErrors.confirmPassword}
        required
      />

      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Create account <ArrowRight size={16} />
      </Button>

      <SocialButtons label="or sign up with" />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}

export default RegisterForm;
