/** Alert — DESIGN-SYSTEM §8.7. Inline contextual feedback with icon + text. */
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

import { cn } from '../../lib/cn.js';

const META = {
  success: { icon: CheckCircle2, cls: 'border-accent/40 text-accent' },
  error: { icon: XCircle, cls: 'border-destructive/40 text-destructive' },
  warning: { icon: AlertTriangle, cls: 'border-status-pending/40 text-status-pending' },
  info: { icon: Info, cls: 'border-primary/40 text-primary' },
};

export function Alert({ variant = 'info', children, className }) {
  const { icon: Icon, cls } = META[variant];
  return (
    <div
      role="alert"
      className={cn('flex items-start gap-2 rounded-md border bg-card px-4 py-3 text-sm', cls, className)}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div className="text-card-foreground">{children}</div>
    </div>
  );
}

export default Alert;
