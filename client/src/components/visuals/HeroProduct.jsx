/**
 * HeroProduct — the "show the product" illustration: a miniature RoomFlow board
 * (availability grid + live booking cards) instead of a stock image.
 *
 * Motion: staggered entrance (skill Stagger List 0.03–0.08s), gentle float loop
 * on the two overlay cards with phase offsets, and a pointer-driven tilt limited
 * to ±6deg. All transform/opacity only; every animation is skipped under
 * prefers-reduced-motion.
 */
import { memo, useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { CalendarCheck2, CheckCircle2, Clock, Users } from 'lucide-react';

import { cn } from '../../lib/cn.js';
import { EASE_2, SPRING_SOFT, floatLoop } from '../../lib/motion.js';

const SLOTS = [
  ['free', 'busy', 'free', 'free', 'busy', 'free'],
  ['busy', 'free', 'free', 'busy', 'free', 'free'],
  ['free', 'free', 'busy', 'free', 'free', 'busy'],
  ['free', 'busy', 'free', 'free', 'busy', 'free'],
];

const ROOMS = ['Seminar Hall A', 'CS Lab 01', 'Conference 3F', 'Library Pod 7'];

export const HeroProduct = memo(function HeroProduct({ className }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), SPRING_SOFT);
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), SPRING_SOFT);

  const onMove = (e) => {
    if (reduce) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={cn('relative', className)}
      style={{ perspective: 1200 }}
    >
      {/* Main board */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 30, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.7, ease: EASE_2, delay: 0.15 }}
        style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        className="sheen glass relative rounded-2xl p-4 shadow-xl ring-1 ring-primary/10 sm:p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-grad-brand text-white">
              <CalendarCheck2 size={14} aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold leading-none text-foreground">Availability</p>
              <p className="mt-1 text-[10px] leading-none text-muted-foreground">Today · Block A</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-accent" /> Free
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-status-pending" /> Booked
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {SLOTS.map((row, r) => (
            <div key={ROOMS[r]} className="flex items-center gap-2">
              <span className="w-20 shrink-0 truncate text-[10px] font-medium text-muted-foreground sm:w-24">
                {ROOMS[r]}
              </span>
              <div className="grid flex-1 grid-cols-6 gap-1.5">
                {row.map((s, c) => (
                  <motion.span
                    key={`${r}-${c}`}
                    initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 + (r * 6 + c) * 0.012, duration: 0.3, ease: EASE_2 }}
                    className={cn(
                      'h-6 rounded-[5px] sm:h-7',
                      s === 'free'
                        ? 'bg-accent/35 ring-1 ring-inset ring-accent/50'
                        : 'bg-status-pending/40 ring-1 ring-inset ring-status-pending/60'
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Floating card — confirmation */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16, x: 10 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, x: 0 }}
        transition={{ delay: 0.6, duration: 0.5, ease: EASE_2 }}
        className="absolute -right-3 -top-6 w-[190px] sm:-right-8"
      >
        <motion.div animate={reduce ? undefined : floatLoop(0, 9)} className="rounded-xl border border-border bg-card p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-accent/12 text-accent">
              <CheckCircle2 size={15} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-foreground">Booking approved</p>
              <p className="font-mono text-[10px] text-muted-foreground">RF-202608-0142</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock size={10} /> 10:00–11:30
            </span>
            <span className="inline-flex items-center gap-1">
              <Users size={10} /> 42
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating card — conflict prevented */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16, x: -10 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, x: 0 }}
        transition={{ delay: 0.78, duration: 0.5, ease: EASE_2 }}
        className="absolute -bottom-8 -left-3 w-[205px] sm:-left-10"
      >
        <motion.div animate={reduce ? undefined : floatLoop(1.6, 8)} className="rounded-xl border border-border bg-card p-3 shadow-lg">
          <p className="text-[11px] font-semibold text-foreground">Conflict prevented</p>
          <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
            Slot taken — suggested <span className="font-medium text-primary">11:30</span>,{' '}
            <span className="font-medium text-primary">14:00</span>
          </p>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.1, duration: 0.9, ease: EASE_2 }}
              style={{ originX: 0 }}
              className="h-full w-full bg-grad-brand"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
});

export default HeroProduct;
