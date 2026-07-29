/** Offline banner — announces connection loss (aria-live), auto-hides on reconnect. */
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-status-pending px-4 py-2 text-xs font-medium text-slate-950"
        >
          <WifiOff size={14} aria-hidden /> You’re offline — changes will not be saved.
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default OfflineBanner;
