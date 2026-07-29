/**
 * LandingNav — glass navbar that materialises on scroll (skill Glassmorphism:
 * "Best for … navigation"). Mobile drawer, theme toggle, primary CTA.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarCheck2, Menu, Moon, Sun, X } from 'lucide-react';

import { Button } from '../../../components/ui/Button.jsx';
import { useTheme } from '../../../hooks/useTheme.js';
import { ROUTES } from '../../../constants/routes.js';
import { cn } from '../../../lib/cn.js';
import { EASE_2 } from '../../../lib/motion.js';

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#workflow', label: 'How it works' },
  { href: '#timeline', label: 'Rollout' },
  { href: '#testimonials', label: 'Customers' },
];

export function LandingNav() {
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE_2 }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5"
    >
      <nav
        className={cn(
          'mx-auto flex h-16 max-w-6xl items-center justify-between rounded-xl px-4 transition-all duration-300 sm:px-5',
          scrolled ? 'glass shadow-lg' : 'border border-transparent'
        )}
      >
        <Link to={ROUTES.LANDING} className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-grad-brand text-white shadow-md">
            <CalendarCheck2 size={18} aria-hidden />
          </span>
          <span className="text-[17px] font-bold tracking-tight text-foreground">RoomFlow</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle colour theme">
            <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </motion.span>
          </Button>
          <Link to={ROUTES.LOGIN} className="hidden sm:block">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link to={ROUTES.REGISTER} className="hidden sm:block">
            <Button size="sm" magnetic>
              Get started
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </Button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass mx-auto mt-2 max-w-6xl rounded-xl p-3 shadow-lg md:hidden"
          >
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-3">
              <Link to={ROUTES.LOGIN}>
                <Button variant="outline" size="sm" className="w-full">
                  Log in
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button size="sm" className="w-full">
                  Get started
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default LandingNav;
