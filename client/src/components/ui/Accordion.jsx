/** Accordion — animated height, button header (keyboard reachable by default). */
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import { cn } from '../../lib/cn.js';
import { EASE_2 } from '../../lib/motion.js';

export function Accordion({ items = [], className }) {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <div className={cn('divide-y divide-border rounded-xl border border-border bg-card', className)}>
      {items.map((it, i) => {
        const open = openIdx === i;
        return (
          <div key={it.q}>
            <button
              onClick={() => setOpenIdx(open ? -1 : i)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
            >
              {it.q}
              <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={16} className="text-muted-foreground" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: EASE_2 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-4 text-sm text-muted-foreground">{it.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default Accordion;
