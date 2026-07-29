import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass } from 'lucide-react';

import { Button } from '../../components/ui/Button.jsx';
import { AuroraBackground } from '../../components/visuals/AuroraBackground.jsx';
import { EASE_2 } from '../../lib/motion.js';

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5">
      <AuroraBackground />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_2 }}
        className="relative text-center"
      >
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-grad-brand text-white shadow-glow">
          <Compass size={24} aria-hidden />
        </span>
        <p className="mt-6 font-mono text-6xl font-bold tracking-tight text-gradient">404</p>
        <h1 className="mt-3 text-xl font-semibold text-foreground">This room doesn’t exist</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          The page you’re looking for may have been moved, or the link is out of date.
        </p>
        <Link to="/" className="mt-7 inline-block">
          <Button size="lg" magnetic>
            <ArrowLeft size={16} /> Back to home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
