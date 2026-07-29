/**
 * FloatingField — DESIGN-SYSTEM §8.2 with a floating label.
 *
 * The label is a REAL <label> that animates position — it is never a placeholder
 * substitute (skill anti-pattern: "Placeholder-only label"). Errors render beside
 * the field and are linked via aria-describedby (§15 #8).
 */
import { forwardRef, useId, useState } from 'react';
import { motion } from 'framer-motion';

import { cn } from '../../lib/cn.js';
import { EASE_2 } from '../../lib/motion.js';

export const FloatingField = forwardRef(function FloatingField(
  { label, error, hint, type = 'text', className, value, onChange, trailing, ...props },
  ref
) {
  const id = useId();
  const errorId = `${id}-err`;
  const [focused, setFocused] = useState(false);
  const lifted = focused || String(value ?? '').length > 0;

  return (
    <div className={cn('mb-4', className)}>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          placeholder=" "
          className={cn(
            'peer h-14 w-full rounded-md border !bg-card/70 px-4 pt-5 pb-1.5 text-sm text-card-foreground',
            'backdrop-blur-xs outline-none transition-all duration-200',
            'hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/15',
            error ? 'border-destructive focus:border-destructive focus:ring-destructive/12' : 'border-border',
            trailing && 'pr-11'
          )}
          {...props}
        />
        <motion.label
          htmlFor={id}
          initial={false}
          animate={{
            top: lifted ? 8 : 17,
            fontSize: lifted ? 11 : 14,
            color: error
              ? 'rgb(var(--c-destructive))'
              : focused
                ? 'rgb(var(--c-primary))'
                : 'rgb(var(--c-muted-foreground))',
          }}
          transition={{ duration: 0.18, ease: EASE_2 }}
          className="pointer-events-none absolute left-4 origin-left font-medium"
        >
          {label}
        </motion.label>
        {trailing && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</div>
        )}
      </div>
      {hint && !error && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <motion.p
          id={errorId}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs font-medium text-destructive"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

export default FloatingField;
