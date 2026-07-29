/** Input — DESIGN-SYSTEM §8.2. 40px height, radius md, aria-invalid on error. */
import { forwardRef } from 'react';

import { cn } from '../../lib/cn.js';

export const Input = forwardRef(function Input({ className, error, ...props }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={error ? 'true' : undefined}
      className={cn(
        'h-10 w-full rounded-md border bg-card px-3 text-sm text-card-foreground placeholder:text-muted-foreground',
        'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring',
        error ? 'border-destructive' : 'border-border',
        className
      )}
      {...props}
    />
  );
});

export default Input;
