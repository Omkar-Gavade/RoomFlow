import { useState } from 'react';
import { Link } from 'react-router-dom';

import { FormField } from '../../../components/ui/FormField.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { authApi } from '../authApi.js';
import { ROUTES } from '../../../constants/routes.js';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
    } finally {
      setSent(true);
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Alert variant="success">
        If that email exists, a reset link has been sent. Check your inbox.
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <FormField label="Email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      <Button type="submit" className="w-full" loading={loading}>
        Send reset link
      </Button>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
          Back to login
        </Link>
      </p>
    </form>
  );
}

export default ForgotPasswordForm;
