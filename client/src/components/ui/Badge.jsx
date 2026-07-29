/**
 * Badge + StatusBadge — DESIGN-SYSTEM §8.6, §2.2.
 * Status carries a dot + text label — never colour alone (§15 #9 / skill
 * "Charts & Data: don't rely on colour alone").
 */
import { cn } from '../../lib/cn.js';
import { STATUS_META } from '../../constants/bookingStatus.js';

export function Badge({ className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status, pulse = false }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <Badge className={cn('border', meta.className)}>
      <span
        aria-hidden
        className={cn('h-1.5 w-1.5 rounded-full', meta.dot, pulse && 'animate-pulse-dot')}
      />
      {meta.label}
    </Badge>
  );
}

export default Badge;
