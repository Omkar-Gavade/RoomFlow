/**
 * AnimatedCounter — count-up KPI value (skill: Executive Dashboard "KPI value
 * animations (count-up)"). Runs once when scrolled into view; renders the final
 * value immediately under reduced motion.
 */
import { memo, useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

import { cn } from '../../lib/cn.js';

export const AnimatedCounter = memo(function AnimatedCounter({
  value = 0,
  duration = 1200,
  suffix = '',
  prefix = '',
  decimals = 0,
  className,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    if (reduce || !inView) {
      if (reduce) setDisplay(target);
      return undefined;
    }
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      // easeOutExpo — fast start, gentle settle
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setDisplay(target * eased);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration, reduce]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
});

export default AnimatedCounter;
