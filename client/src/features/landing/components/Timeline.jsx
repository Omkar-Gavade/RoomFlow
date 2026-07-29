/**
 * Timeline — rollout plan. The connecting rail draws itself as the section
 * scrolls (scroll-linked scaleY via useScroll → transform only, no layout work).
 * Rows reveal with the standard tier (y 24 / 0.5s / stagger 0.08).
 */
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';

import { Card } from '../../../components/ui/Card.jsx';
import { Reveal } from '../../../components/ui/Reveal.jsx';
import { cn } from '../../../lib/cn.js';
import { fadeUp, staggerContainer, VIEWPORT } from '../../../lib/motion.js';

const PHASES = [
  { week: 'Week 1', title: 'Import your spaces', text: 'Bulk-add rooms with capacity, facilities, photos and operating hours.' },
  { week: 'Week 2', title: 'Invite your people', text: 'Roles assigned automatically — admins, staff approvers, students and guests.' },
  { week: 'Week 3', title: 'Switch on approvals', text: 'Auto-approve trusted staff, route everything else to a single queue.' },
  { week: 'Week 4', title: 'Measure and tune', text: 'Utilisation reports reveal dead rooms and peak-hour pressure.' },
];

export function Timeline() {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] });
  const scaleY = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1]), {
    stiffness: 90,
    damping: 22,
  });

  return (
    <section id="timeline" className="scroll-mt-24 py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-5">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Rollout</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Live in a month, not a semester
          </h2>
        </Reveal>

        <div ref={ref} className="relative mt-14 pl-10 sm:pl-14">
          {/* rail */}
          <div className="absolute left-3 top-2 h-[calc(100%-1rem)] w-px bg-border sm:left-5" aria-hidden />
          <motion.div
            aria-hidden
            style={{ scaleY: reduce ? 1 : scaleY, originY: 0 }}
            className="absolute left-3 top-2 h-[calc(100%-1rem)] w-px bg-grad-brand sm:left-5"
          />

          <motion.ol
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            variants={staggerContainer}
            className="space-y-5"
          >
            {PHASES.map((p, i) => (
              <motion.li key={p.week} variants={fadeUp} className="relative">
                <span
                  className={cn(
                    'absolute -left-[1.85rem] top-5 h-3 w-3 rounded-full border-2 border-background bg-primary sm:-left-[2.35rem]'
                  )}
                  aria-hidden
                />
                <Card hover className="p-5">
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-primary">
                    {p.week}
                  </p>
                  <h3 className="mt-1.5 text-base font-semibold text-foreground">{p.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.text}</p>
                </Card>
                <span className="sr-only">Step {i + 1}</span>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </div>
    </section>
  );
}

export default Timeline;
