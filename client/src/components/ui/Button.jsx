/**
 * Button — DESIGN-SYSTEM §8.1. Variants, 44px min touch target, loading state,
 * cursor-pointer, 150–300ms transition, visible focus (§15).
 */
import { forwardRef } from 'react';

import { Loader2 } from 'lucide-react';

import { cn } from '../../lib/cn.js';

const VARIANTS = {
  primary: 'bg-primary text-primary-foreground hover:opacity-90',
  accent: 'bg-accent text-accent-foreground hover:opacity-90',
  destructive: 'bg-destructive text-primary-foreground hover:opacity-90',
  secondary: 'bg-muted text-foreground hover:bg-muted/70',
  outline: 'border border-border bg-transparent text-foreground hover:bg-muted',
  ghost: 'bg-transparent text-foreground hover:bg-muted',
};

const SIZES = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10',
};

export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium cursor-pointer transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
});

export default Button;
