/**
 * StatCard — DESIGN-SYSTEM §8.3 (KPI) + skill "Executive Dashboard":
 * large mono value, count-up animation, trend indicator, sparkline, status
 * colour on a left border. Max 4–6 per view (enforced by the page, not here).
 */
import { memo } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';

import { Card } from './Card.jsx';
import { AnimatedCounter } from './AnimatedCounter.jsx';
import { Sparkline } from './AreaChart.jsx';
import { cn } from '../../lib/cn.js';

export const StatCard = memo(function StatCard({
  label,
  value,
  suffix = '',
  icon: Icon,
  trend,
  spark,
  tone = 'primary',
  className,
}) {
  const toneMap = {
    primary: 'text-primary',
    accent: 'text-accent',
    pending: 'text-status-pending',
    destructive: 'text-destructive',
  };
  const up = typeof trend === 'number' && trend >= 0;

  return (
    <Card variant="solid" hover className={cn('overflow-hidden p-5', className)}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <span className={cn('rounded-md bg-muted p-2', toneMap[tone])}>
            <Icon size={16} aria-hidden />
          </span>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="font-mono text-3xl font-bold tracking-tight text-foreground">
          <AnimatedCounter value={Number(value) || 0} suffix={suffix} />
        </p>
        {spark && <Sparkline data={spark} className={cn('opacity-70', toneMap[tone])} />}
      </div>

      {typeof trend === 'number' && (
        <div className="mt-2 flex items-center gap-1 text-xs">
          <span className={cn('inline-flex items-center gap-1 font-medium', up ? 'text-accent' : 'text-destructive')}>
            {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {Math.abs(trend)}%
          </span>
          <span className="text-muted-foreground">vs last week</span>
        </div>
      )}
    </Card>
  );
});

export default StatCard;
