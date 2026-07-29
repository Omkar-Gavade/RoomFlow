/**
 * Hero — skill landing pattern "Trust & Authority + Conversion", section 1:
 * hero states the mission and credibility; primary CTA + secondary path.
 *
 * Headline animates word-by-word (skill Stagger List: small per-item delay,
 * short headline only — never split-animate paragraphs). Falls back to a plain
 * static headline under prefers-reduced-motion.
 */
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Sparkles, Zap } from 'lucide-react';

import { Button } from '../../../components/ui/Button.jsx';
import { AuroraBackground } from '../../../components/visuals/AuroraBackground.jsx';
import { HeroProduct } from '../../../components/visuals/HeroProduct.jsx';
import { ROUTES } from '../../../constants/routes.js';
import { EASE_2 } from '../../../lib/motion.js';

const HEADLINE = ['Book', 'any', 'room.', 'Never', 'double-book', 'again.'];

const PILLS = [
  { icon: Zap, text: 'Real-time availability' },
  { icon: ShieldCheck, text: 'Conflict-free engine' },
  { icon: Sparkles, text: 'Approval workflows' },
];

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden pb-24 pt-32 sm:pt-36 lg:pb-32 lg:pt-40">
      <AuroraBackground />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        {/* Copy */}
        <div>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_2 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 py-1.5 pl-1.5 pr-3.5 text-xs backdrop-blur-xs"
          >
            <span className="rounded-full bg-grad-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              New
            </span>
            <span className="text-muted-foreground">Transactional booking engine — zero conflicts</span>
          </motion.div>

          <h1 className="text-display-sm font-bold text-foreground sm:text-display-md lg:text-[3.75rem] lg:leading-[1.03]">
            {reduce ? (
              <>
                Book any room. <span className="text-gradient">Never double-book again.</span>
              </>
            ) : (
              HEADLINE.map((word, i) => (
                <motion.span
                  key={word + i}
                  initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.08 + i * 0.07, duration: 0.5, ease: EASE_2 }}
                  className={i > 2 ? 'text-gradient mr-[0.28em] inline-block' : 'mr-[0.28em] inline-block'}
                >
                  {word}
                </motion.span>
              ))
            )}
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: EASE_2 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            RoomFlow digitises room booking for universities, offices, libraries and training
            centres — real-time availability, approval workflows, and a conflict engine that makes
            double-booking impossible.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5, ease: EASE_2 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link to={ROUTES.REGISTER}>
              <Button size="lg" magnetic className="w-full sm:w-auto">
                Start booking free <ArrowRight size={17} />
              </Button>
            </Link>
            <Link to={ROUTES.LOGIN}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                View live demo
              </Button>
            </Link>
          </motion.div>

          <motion.ul
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-3"
          >
            {PILLS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon size={15} className="text-accent" aria-hidden />
                {text}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Product visual */}
        <HeroProduct className="mx-auto w-full max-w-[440px] lg:max-w-none" />
      </div>
    </section>
  );
}

export default Hero;
