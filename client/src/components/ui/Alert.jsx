/** Alert — DESIGN-SYSTEM §8.7. Icon + text (never colour alone), role="alert". */
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

import { cn } from '../../lib/cn.js';

const META = {
  success: { icon: CheckCircle2, cls: 'border-accent/30 bg-accent/8 text-accent' },
  error: { icon: XCircle, cls: 'border-destructive/30 bg-destructive/8 text-destructive' },
  warning: { icon: AlertTriangle, cls: 'border-status-pending/30 bg-status-pending/8 text-status-pending' },
  info: { icon: Info, cls: 'border-primary/30 bg-primary/8 text-primary' },
};

export function Alert({ variant = 'info', title, children, className }) {
  const { icon: Icon, cls } = META[variant];
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex items-start gap-3 rounded-lg border px-4 py-3 text-sm', cls, className)}
    >
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        <div className="text-card-foreground/85">{children}</div>
      </div>
    </motion.div>
  );
}

export default Alert;
