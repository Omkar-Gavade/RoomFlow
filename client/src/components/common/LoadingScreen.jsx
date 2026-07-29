/** Full-screen loader — prevents flash-of-login during auth restore (§11.4). */
import { motion } from 'framer-motion';

import { AuroraBackground } from '../visuals/AuroraBackground.jsx';

export function LoadingScreen({ label = 'Loading…' }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background">
      <AuroraBackground grid={false} />
      <div className="relative flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <motion.span
            className="absolute inset-0 rounded-xl bg-grad-brand"
            animate={{ scale: [1, 0.86, 1], rotate: [0, 90, 180] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            className="absolute inset-0 rounded-xl bg-grad-brand opacity-40 blur-md"
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <p className="text-sm text-muted-foreground" role="status">
          {label}
        </p>
      </div>
    </div>
  );
}

export default LoadingScreen;
