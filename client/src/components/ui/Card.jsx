/** Card — DESIGN-SYSTEM §8.3. Surface, border, radius lg, subtle shadow. */
import { cn } from '../../lib/cn.js';

export function Card({ className, ...props }) {
  return (
    <div
      className={cn('rounded-lg border border-border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('p-6 pb-2', className)} {...props} />;
}
export function CardTitle({ className, ...props }) {
  return <h3 className={cn('text-lg font-semibold', className)} {...props} />;
}
export function CardBody({ className, ...props }) {
  return <div className={cn('p-6 pt-2', className)} {...props} />;
}

export default Card;
