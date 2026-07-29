import { cn } from '../../lib/cn.js';

/** Skeleton loader — DESIGN-SYSTEM §14.3 (never blank; reserve space, CLS<0.1). */
export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} />;
}

export default Skeleton;
