/**
 * Card — DESIGN-SYSTEM §8.3 + skill Glassmorphism.
 * Variants: solid (default), glass (blur 16px + light border), gradient (hairline
 * gradient ring). Optional hover lift — transform only, reduced-motion aware.
 */
import { motion, useReducedMotion } from 'framer-motion';

import { cn } from '../../lib/cn.js';
import { EASE_2 } from '../../lib/motion.js';

const VARIANTS = {
  solid: 'sheen bg-card border border-border shadow-sm',
  glass: 'sheen glass shadow-md',
  gradient: 'sheen bg-card border border-border shadow-md ring-gradient',
  plain: 'bg-card/50 border border-border/60',
};

export function Card({ variant = 'solid', hover = false, className, children, ...props }) {
  const reduce = useReducedMotion();
  const Comp = hover && !reduce ? motion.div : 'div';
  const motionProps =
    hover && !reduce
      ? {
          whileHover: { y: -4, transition: { duration: 0.2, ease: EASE_2 } },
        }
      : {};

  return (
    <Comp
      className={cn(
        // NOTE: no `overflow-hidden` here — it clipped taller card bodies when a
        // grid row stretched items to equal height. The sheen/ring use inherited
        // radius + masks, so they render correctly without clipping.
        // `min-w-0`: grid/flex items default to min-width:auto and refuse to
        // shrink below their content, which let a wide list row stretch the card
        // past the viewport (horizontal scroll on mobile).
        'relative min-w-0 rounded-xl text-card-foreground transition-[box-shadow,border-color] duration-300',
        VARIANTS[variant],
        hover && 'hover:border-primary/30 hover:shadow-lg',
        className
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </Comp>
  );
}

/**
 * `flex-wrap` + `min-w-0` on the text column: without them a title beside an
 * action button cannot shrink (flex items default to min-width:auto), which
 * pushed cards past the viewport and produced horizontal scroll on mobile.
 */
export function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn('flex flex-wrap items-start justify-between gap-3 p-5 pb-3 [&>*]:min-w-0', className)}
      {...props}
    />
  );
}
export function CardTitle({ className, ...props }) {
  return <h3 className={cn('text-base font-semibold tracking-tight', className)} {...props} />;
}
export function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}
export function CardBody({ className, ...props }) {
  return <div className={cn('p-5 pt-0', className)} {...props} />;
}
export function CardFooter({ className, ...props }) {
  return <div className={cn('flex items-center gap-2 border-t border-border p-4', className)} {...props} />;
}

export default Card;
