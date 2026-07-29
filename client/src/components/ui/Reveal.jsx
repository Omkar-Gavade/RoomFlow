/**
 * Reveal / RevealGroup — scroll-reveal wrappers using the skill's motion tiers
 * (motion.csv → Scroll Reveal Subtle & Standard).
 *
 * `once: true` mirrors GSAP `toggleActions: play none none reverse` intent — the
 * reveal does not re-trigger on every scroll direction change. Under
 * prefers-reduced-motion the content renders immediately with no transform.
 */
import { motion, useReducedMotion } from 'framer-motion';

import { fadeUp, fadeUpSubtle, staggerContainer, VIEWPORT } from '../../lib/motion.js';
import { cn } from '../../lib/cn.js';

export function Reveal({ children, subtle = false, delay = 0, className, as = 'div', ...props }) {
  const reduce = useReducedMotion();
  const Comp = motion[as] || motion.div;
  const variants = subtle ? fadeUpSubtle : fadeUp;

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <Comp
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={variants}
      transition={{ delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Comp>
  );
}

/** Container that staggers its direct children (skill cap: ≤8 children @ 0.08s). */
export function RevealGroup({ children, className, as = 'div', ...props }) {
  const reduce = useReducedMotion();
  const Comp = motion[as] || motion.div;

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <Comp
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={staggerContainer}
      className={cn(className)}
      {...props}
    >
      {children}
    </Comp>
  );
}

/** Child of RevealGroup. */
export function RevealItem({ children, className, as = 'div', ...props }) {
  const reduce = useReducedMotion();
  const Comp = motion[as] || motion.div;
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <Comp variants={fadeUp} className={cn(className)} {...props}>
      {children}
    </Comp>
  );
}

export default Reveal;
