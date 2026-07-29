/**
 * Marquee — infinite logo/trust strip. CSS keyframe on transform (GPU), paused on
 * hover, duplicated track for a seamless loop, edge mask so it fades not clips.
 * Decorative motion → paused entirely under prefers-reduced-motion.
 */
import { memo } from 'react';
import { useReducedMotion } from 'framer-motion';

import { cn } from '../../lib/cn.js';

export const Marquee = memo(function Marquee({ items = [], className }) {
  const reduce = useReducedMotion();
  const track = [...items, ...items];

  return (
    <div
      className={cn(
        'group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]',
        className
      )}
    >
      <div
        className={cn(
          'flex w-max items-center gap-12',
          !reduce && 'animate-marquee group-hover:[animation-play-state:paused]'
        )}
      >
        {track.map((it, i) => (
          <span
            key={`${it}-${i}`}
            className="whitespace-nowrap text-sm font-semibold tracking-tight text-muted-foreground/70 transition-colors hover:text-foreground"
          >
            {it}
          </span>
        ))}
      </div>
    </div>
  );
});

export default Marquee;
