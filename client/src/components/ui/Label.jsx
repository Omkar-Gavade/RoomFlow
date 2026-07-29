/** Label — DESIGN-SYSTEM §8.2 (visible labels, never placeholder-as-label). */
import { cn } from '../../lib/cn.js';

export function Label({ className, children, required, ...props }) {
  return (
    <label className={cn('mb-1.5 block text-sm font-medium text-foreground', className)} {...props}>
      {children}
      {required && <span className="ml-0.5 text-destructive">*</span>}
    </label>
  );
}

export default Label;
