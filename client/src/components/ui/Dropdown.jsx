/** Dropdown — click-outside + Esc close, spring pop, role="menu". */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { cn } from '../../lib/cn.js';
import { SPRING_SOFT } from '../../lib/motion.js';

export function Dropdown({ trigger, children, align = 'right', className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
        {trigger}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: SPRING_SOFT }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.12 } }}
            onClick={() => setOpen(false)}
            className={cn(
              'absolute z-40 mt-2 min-w-[13rem] overflow-hidden rounded-lg border border-border bg-card p-1.5 shadow-lg',
              align === 'right' ? 'right-0' : 'left-0',
              className
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropdownItem({ icon: Icon, className, children, ...props }) {
  return (
    <button
      role="menuitem"
      className={cn(
        'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted',
        className
      )}
      {...props}
    >
      {Icon && <Icon size={15} className="text-muted-foreground" aria-hidden />}
      {children}
    </button>
  );
}

export default Dropdown;
