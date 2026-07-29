import { Loader2 } from 'lucide-react';

import { cn } from '../../lib/cn.js';

/** Spinner — wrapper div animates, not the SVG (skill: SVG Animation Wrapper). */
export function Spinner({ className, size = 20 }) {
  return (
    <div className={cn('inline-flex animate-spin text-primary', className)} role="status" aria-label="Loading">
      <Loader2 size={size} aria-hidden />
    </div>
  );
}

export default Spinner;
