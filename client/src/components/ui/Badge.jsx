/** Badge + StatusBadge — DESIGN-SYSTEM §8.6, §2.2 (icon/text, never colour alone). */
import { cn } from '../../lib/cn.js';
import { STATUS_META } from '../../constants/bookingStatus.js';

export function Badge({ className, children, ...props }) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', className)}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return <Badge className={meta.className}>{meta.label}</Badge>;
}

export default Badge;
