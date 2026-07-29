/**
 * Skeleton — shimmer loading placeholder. Reserves layout space so async content
 * does not shift the page (skill: Performance / CLS < 0.1).
 */
import { cn } from '../../lib/cn.js';

export function Skeleton({ className }) {
  return <div className={cn('shimmer rounded-md bg-muted/70', className)} />;
}

/** Card-shaped skeleton used by dashboard/list loading states. */
export function SkeletonCard({ className }) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-5', className)}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-8 w-20" />
      <Skeleton className="mt-4 h-2 w-full" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3">
      <Skeleton className="h-9 w-9 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="mt-2 h-2.5 w-1/4" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  );
}

export default Skeleton;
