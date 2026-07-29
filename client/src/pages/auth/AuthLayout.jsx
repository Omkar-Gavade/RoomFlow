/**
 * AuthLayout — DESIGN-SYSTEM §13.2.2 split layout, upgraded:
 * left brand panel with aurora + live proof cards, right form column (max 420px).
 * The panel is decorative and hidden below lg, so mobile gets a focused form.
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarCheck2, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

import { AuroraBackground } from '../../components/visuals/AuroraBackground.jsx';
import { ROUTES } from '../../constants/routes.js';
import { EASE_2, staggerContainer, fadeUp } from '../../lib/motion.js';

const PROOF = [
  { icon: ShieldCheck, title: 'Conflict-free by design', text: 'Overlaps rejected inside a transaction.' },
  { icon: Sparkles, title: 'Approvals in one queue', text: 'Act on every request from a single screen.' },
  { icon: CheckCircle2, title: 'Reminders that land', text: 'Email invites and 1-hour nudges, automatic.' },
];

export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Brand panel */}
      <aside className="relative hidden min-h-screen w-[46%] flex-col justify-between overflow-hidden border-r border-border bg-card/60 p-12 lg:flex xl:w-1/2">
        <AuroraBackground />
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-violet/10"
          aria-hidden
        />
        <div className="noise absolute inset-0" aria-hidden />

        <Link to={ROUTES.LANDING} className="relative flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-grad-brand text-white shadow-md">
            <CalendarCheck2 size={18} aria-hidden />
          </span>
          <span className="text-[17px] font-bold tracking-tight text-foreground">RoomFlow</span>
        </Link>

        <motion.div initial="hidden" animate="show" variants={staggerContainer} className="relative">
          <motion.h2 variants={fadeUp} className="max-w-md text-4xl font-bold leading-tight tracking-tight text-foreground">
            Every room, <span className="text-gradient">every slot</span>, always current.
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 max-w-sm text-base text-muted-foreground">
            Join the campuses and workplaces that retired the paper register.
          </motion.p>

          <motion.ul variants={staggerContainer} className="mt-10 space-y-3">
            {PROOF.map(({ icon: Icon, title: t, text }) => (
              <motion.li
                key={t}
                variants={fadeUp}
                className="glass flex items-start gap-3 rounded-xl p-4 shadow-sm"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/12 text-accent">
                  <Icon size={17} aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{text}</p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        <p className="relative text-xs text-muted-foreground">© {new Date().getFullYear()} RoomFlow</p>
      </aside>

      {/* Form column */}
      <main className="relative flex min-h-screen w-full items-center justify-center px-5 py-10 lg:w-[54%] xl:w-1/2">
        <div className="absolute inset-0 lg:hidden">
          <AuroraBackground grid={false} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE_2 }}
          className="relative w-full max-w-[420px]"
        >
          <Link to={ROUTES.LANDING} className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-grad-brand text-white">
              <CalendarCheck2 size={18} aria-hidden />
            </span>
            <span className="text-[17px] font-bold tracking-tight text-foreground">RoomFlow</span>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}

          <div className="mt-7">{children}</div>
          {footer}
        </motion.div>
      </main>
    </div>
  );
}

export default AuthLayout;
