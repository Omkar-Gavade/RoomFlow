/**
 * ToastContext — transient feedback (DESIGN-SYSTEM §8.7).
 * Toasts auto-dismiss; announced via aria-live for screen readers (§15 #13).
 */
import { createContext, useCallback, useMemo, useState } from 'react';

import { X } from 'lucide-react';

import { cn } from '../lib/cn.js';

export const ToastContext = createContext(null);

const VARIANT = {
  success: 'border-accent text-accent',
  error: 'border-destructive text-destructive',
  warning: 'border-status-pending text-status-pending',
  info: 'border-primary text-primary',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback(
    (message, variant = 'info', duration = 4500) => {
      const id = crypto.randomUUID();
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
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              'flex items-center gap-3 rounded-md border-l-4 bg-card px-4 py-3 shadow-lg text-sm text-card-foreground min-w-[260px] max-w-sm',
              VARIANT[t.variant]
            )}
          >
            <span className="flex-1 text-card-foreground">{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
