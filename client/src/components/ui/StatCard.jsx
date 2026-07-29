/** StatCard — DESIGN-SYSTEM §8.3 (KPI): large mono value, label, optional icon. */
import { Card } from './Card.jsx';
import { cn } from '../../lib/cn.js';

export function StatCard({ label, value, icon: Icon, accent = 'text-primary', className }) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon && <Icon size={18} className={accent} />}
      </div>
      <p className="mt-2 font-mono text-3xl font-bold text-foreground tabular-nums">{value}</p>
    </Card>
  );
}

export default StatCard;
