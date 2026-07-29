import { Loader2 } from 'lucide-react';

import { cn } from '../../lib/cn.js';

export function Spinner({ className, size = 20 }) {
  return <Loader2 size={size} className={cn('animate-spin text-primary', className)} aria-label="Loading" />;
}

export default Spinner;
