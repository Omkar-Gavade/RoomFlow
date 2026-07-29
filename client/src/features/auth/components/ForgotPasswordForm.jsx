import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { motion } from 'framer-motion';

import { FloatingField } from '../../../components/ui/FloatingField.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { authApi } from '../authApi.js';
import { ROUTES } from '../../../constants/routes.js';
import { SPRING_SOFT } from '../../../lib/motion.js';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
    } catch {
      // Response is intentionally generic — never reveal whether the email exists.
    } finally {
      setSent(true);
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1, transition: SPRING_SOFT }}
        className="rounded-xl border border-accent/25 bg-accent/8 p-6 text-center"
      >
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent/15 text-accent">
          <MailCheck size={22} aria-hidden />
        </span>
        <h2 className="mt-4 text-base font-semibold text-foreground">Check your inbox</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          If an account exists for <span className="font-medium text-foreground">{email}</span>,
          a reset link is on its way. It expires in 15 minutes.
        </p>
        <Link to={ROUTES.LOGIN}>
          <Button variant="outline" className="mt-5">
            <ArrowLeft size={15} /> Back to login
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <FloatingField
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Send reset link
      </Button>
      <p className="mt-6 text-center text-sm">
        <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
          <ArrowLeft size={14} /> Back to login
        </Link>
      </p>
    </form>
  );
}

export default ForgotPasswordForm;
