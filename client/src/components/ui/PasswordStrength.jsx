/**
 * PasswordStrength — mirrors the backend policy in auth.validation.js
 * (8+ chars, upper, lower, digit, symbol). Animated segmented meter with a text
 * label, so strength is never conveyed by colour alone (§15 #9).
 */
import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

import { cn } from '../../lib/cn.js';

const LEVELS = [
  { label: 'Too weak', bar: 'bg-destructive', text: 'text-destructive' },
  { label: 'Weak', bar: 'bg-status-pending', text: 'text-status-pending' },
  { label: 'Fair', bar: 'bg-status-pending', text: 'text-status-pending' },
  { label: 'Strong', bar: 'bg-accent', text: 'text-accent' },
  { label: 'Excellent', bar: 'bg-accent', text: 'text-accent' },
];

export const PasswordStrength = memo(function PasswordStrength({ value = '' }) {
  const score = useMemo(() => {
    if (!value) return -1;
    let s = 0;
    if (value.length >= 8) s += 1;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) s += 1;
    if (/\d/.test(value)) s += 1;
    if (/[^A-Za-z0-9]/.test(value)) s += 1;
    return Math.min(s, 4);
  }, [value]);

  if (score < 0) return null;
  const level = LEVELS[score];

  return (
    <div className="-mt-2 mb-4" aria-live="polite">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: i < score ? 1 : 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{ originX: 0 }}
              className={cn('h-full w-full rounded-full', level.bar)}
            />
          </div>
        ))}
      </div>
      <p className={cn('mt-1.5 text-xs font-medium', level.text)}>
        Password strength: {level.label}
      </p>
    </div>
  );
});

export default PasswordStrength;
