/**
 * Progress bar + ProgressRing — utilisation indicators.
 * The ring animates its stroke-dashoffset on a wrapper-free SVG path; the value
 * is also printed as text (never colour/shape alone, §15 #9).
 */
import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { cn } from '../../lib/cn.js';
import { EASE_2 } from '../../lib/motion.js';

export function Progress({ value = 0, className, barClassName, label }) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-mono font-medium text-foreground">{Math.round(value)}%</span>
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: Math.max(0, Math.min(value, 100)) / 100 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE_2 }}
          style={{ originX: 0 }}
          className={cn('h-full w-full rounded-full bg-grad-brand', barClassName)}
        />
      </div>
    </div>
  );
}

export const ProgressRing = memo(function ProgressRing({
  value = 0,
  size = 96,
  stroke = 8,
  label,
  className,
}) {
  const reduce = useReducedMotion();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(value, 100));

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${label || 'Progress'}: ${Math.round(pct)}%`}>
        <defs>
          <linearGradient id="rf-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgb(var(--c-primary))" />
            <stop offset="100%" stopColor="rgb(var(--c-violet))" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="url(#rf-ring)"
          strokeDasharray={c}
          initial={{ strokeDashoffset: reduce ? c - (pct / 100) * c : c }}
          whileInView={{ strokeDashoffset: c - (pct / 100) * c }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: EASE_2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-lg font-bold text-foreground">{Math.round(pct)}%</span>
        {label && <span className="text-[10px] text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
});

export default Progress;
