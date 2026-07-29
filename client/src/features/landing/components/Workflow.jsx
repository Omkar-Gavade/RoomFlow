/**
 * Workflow — skill landing pattern "Funnel (3-Step Conversion)":
 * Step 1 (problem) → Step 2 (solution) → Step 3 (action), each with a mini-CTA
 * and a progress indicator, ending in the main CTA. Progressive disclosure: the
 * active step's detail panel is the only expanded one.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CalendarSearch, CheckCircle2, Send } from 'lucide-react';

import { Card } from '../../../components/ui/Card.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Reveal } from '../../../components/ui/Reveal.jsx';
import { cn } from '../../../lib/cn.js';
import { EASE_2 } from '../../../lib/motion.js';
import { ROUTES } from '../../../constants/routes.js';

const STEPS = [
  {
    icon: CalendarSearch,
    title: 'Find a free slot',
    problem: 'Chasing whoever holds the register.',
    detail:
      'Filter by capacity, facilities and building, then pick a date. Taken slots are disabled before you can select them — prevention, not error messages.',
    cta: 'Browse rooms',
  },
  {
    icon: Send,
    title: 'Request in three fields',
    problem: 'Paper forms and email threads.',
    detail:
      'Purpose, attendees, confirm. A live conflict check runs as you choose the slot, and if it clashes you get the next three free windows instantly.',
    cta: 'See the flow',
  },
  {
    icon: CheckCircle2,
    title: 'Get approved and reminded',
    problem: 'No idea whether it was accepted.',
    detail:
      'Approvers act from one queue. You get an email with a calendar invite on approval, and a reminder an hour before it starts.',
    cta: 'Start free',
  },
];

export function Workflow() {
  const [active, setActive] = useState(0);

  return (
    <section id="workflow" className="scroll-mt-24 border-y border-border bg-card/40 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">How it works</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            From “who has the key?” to booked in 30 seconds
          </h2>
        </Reveal>

        {/* Progress indicator */}
        <div className="mx-auto mt-12 flex max-w-3xl items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex flex-1 items-center gap-2">
              <button
                onClick={() => setActive(i)}
                aria-current={active === i}
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300',
                  i <= active
                    ? 'bg-grad-brand text-white shadow-md'
                    : 'border border-border bg-card text-muted-foreground'
                )}
              >
                {i + 1}
              </button>
              {i < STEPS.length - 1 && (
                <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-border">
                  <motion.div
                    animate={{ scaleX: i < active ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: EASE_2 }}
                    style={{ originX: 0 }}
                    className="h-full w-full bg-grad-brand"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = active === i;
            return (
              <Card
                key={s.title}
                variant={isActive ? 'gradient' : 'solid'}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  'cursor-pointer p-6 transition-all duration-300',
                  isActive ? 'shadow-lg' : 'opacity-80 hover:opacity-100'
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'grid h-10 w-10 place-items-center rounded-lg transition-colors',
                      isActive ? 'bg-grad-brand text-white' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Icon size={18} aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{s.title}</p>
                    <p className="text-xs text-muted-foreground line-through decoration-destructive/60">
                      {s.problem}
                    </p>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: EASE_2 }}
                      className="overflow-hidden"
                    >
                      <p className="pt-4 text-sm leading-relaxed text-muted-foreground">{s.detail}</p>
                      <Link
                        to={ROUTES.REGISTER}
                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                      >
                        {s.cta} <ArrowRight size={14} />
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>

        <Reveal className="mt-10 text-center">
          <Link to={ROUTES.REGISTER}>
            <Button size="lg" magnetic>
              Create your first booking <ArrowRight size={17} />
            </Button>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export default Workflow;
