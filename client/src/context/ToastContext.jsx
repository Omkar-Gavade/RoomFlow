/**
 * ToastContext — DESIGN-SYSTEM §8.7. Spring entrance, swipe-free dismiss button,
 * announced through an aria-live region (assertive for errors, §15 #13).
 */
import { createContext, useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

import { cn } from '../lib/cn.js';
import { SPRING_SOFT } from '../lib/motion.js';

export const ToastContext = createContext(null);

const META = {
  success: { icon: CheckCircle2, bar: 'bg-accent', tint: 'text-accent' },
  error: { icon: XCircle, bar: 'bg-destructive', tint: 'text-destructive' },
  warning: { icon: AlertTriangle, bar: 'bg-status-pending', tint: 'text-status-pending' },
  info: { icon: Info, bar: 'bg-primary', tint: 'text-primary' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback(
    (message, variant = 'info', duration = 4500) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((t) => [...t, { id, message, variant }]);
      if (duration) setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      toast,
      success: (m) => toast(m, 'success'),
      error: (m) => toast(m, 'error'),
      warning: (m) => toast(m, 'warning'),
      info: (m) => toast(m, 'info'),
    }),
    [toast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 top-4 z-[70] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-5 sm:items-end"
        aria-live="polite"
        aria-atomic="false"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const { icon: Icon, bar, tint } = META[t.variant];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: SPRING_SOFT }}
                exit={{ opacity: 0, x: 24, scale: 0.97, transition: { duration: 0.18 } }}
                role={t.variant === 'error' ? 'alert' : 'status'}
                className="pointer-events-auto flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-lg border border-border bg-card p-3.5 shadow-lg"
              >
                <span className={cn('absolute left-0 top-0 h-full w-1', bar)} aria-hidden />
                <Icon size={17} className={cn('mt-0.5 shrink-0', tint)} aria-hidden />
                <p className="flex-1 text-sm text-card-foreground">{t.message}</p>
                <button
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss notification"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X size={15} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
