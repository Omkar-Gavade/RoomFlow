/**
 * DashboardLayout — app shell with animated page transitions.
 * AnimatePresence keys on pathname so each route fades/slides in (0.3s in,
 * 0.2s out — short enough that navigation never feels delayed).
 */
import { Suspense, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';
import { Spinner } from '../ui/Spinner.jsx';
import { pageTransition } from '../../lib/motion.js';

export function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setOpen(true)} />
        <main id="main" className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Suspense
                fallback={
                  <div className="flex justify-center py-20">
                    <Spinner size={26} />
                  </div>
                }
              >
                <Outlet />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
